from flask import Flask
from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from decimal import Decimal

app = Flask(__name__)
app.secret_key = 'your_secret_key'


basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'bank.db')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# postman, api calls. use postman to test the backend, json format


class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    full_name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone_number = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login_at = db.Column(db.DateTime)
    accounts = db.relationship('Account', backref='user', lazy=True)


class Account(db.Model):
    account_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    account_number = db.Column(db.String(20), unique=True, nullable=False)
    account_type = db.Column(db.String(50), nullable=False)
    balance = db.Column(db.Numeric(12, 2), nullable=False, default=0.00)
    status = db.Column(db.String(20), default='Active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    ifsc_code = db.Column(db.String(20))
    branch_name = db.Column(db.String(100))
    transactions = db.relationship('Transaction', backref='account', lazy=True)


class Transaction(db.Model):
    transaction_id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('account.account_id'), nullable=False)
    transaction_type = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    balance = db.Column(db.Numeric(12, 2), nullable=False, default=0.00)
    description = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    

@app.route('/', methods=['GET', 'POST'])
def login():
    message = ""
    
    if request.method == 'POST':
        username = request.form['username']
        
        password = request.form['password']

        user = User.query.filter_by(username=username).first()

        if user and user.password_hash == password:
            session['username'] = username
            return redirect(url_for('dashboard'))
        else:
            message = "User not found or incorrect password!"
    
    return render_template('login.html', message=message)

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()  # expect JSON body

    if not data:
        return {"error": "Missing JSON body"}, 400

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return {"error": "Username and password required"}, 400

    user = User.query.filter_by(username=username).first()

    if user and user.password_hash == password:
        session['username'] = username
        return {
            "message": "Login successful",
            "username": username,
            "user_id": user.user_id
        }, 200
    else:
        return {"error": "Invalid username or password"}, 401


@app.route('/dashboard')
def dashboard():
    
    if 'username' not in session:
        return redirect(url_for('login'))
    user = User.query.filter_by(username=session['username']).first()
    accounts = Account.query.filter_by(user_id=user.user_id).all()

    print(f"Logged in as: {user.username} (user_id={user.user_id})")
    print(f"Accounts: {[a.account_number for a in accounts]}")

    return render_template('dashboard.html', accounts=accounts)

@app.route('/dashboard/summary')
def account_summary():
    if 'username' not in session:
        return redirect(url_for('login'))
    user = User.query.filter_by(username=session['username']).first()
    accounts = Account.query.filter_by(user_id=user.user_id).all()
    return render_template('account_summary.html', accounts=accounts)

@app.route('/account/<int:account_id>')
def account_details(account_id):
    if 'username' not in session:
        return redirect(url_for('login'))
    user = User.query.filter_by(username=session['username']).first()
    account = Account.query.filter_by(account_id=account_id, user_id=user.user_id).first()
    transactions = Transaction.query.filter_by(account_id=account.account_id).order_by(Transaction.timestamp.desc()).all()
    return render_template('account_details.html', account=account, transactions=transactions)

@app.route('/add_account', methods=['GET', 'POST'])
def add_account():
    if 'username' not in session:
        return redirect(url_for('login'))
    user = User.query.filter_by(username=session['username']).first()
    if request.method == 'POST':
        new_account = Account(
            account_number=request.form['account_number'],
            account_type=request.form['account_type'],
            balance=request.form['balance'],
            user_id=user.user_id,  
            status='Active',
            created_at=datetime.utcnow()
        )
        db.session.add(new_account)
        db.session.commit()
        return redirect(url_for('dashboard'))
    return render_template('add_account.html')


@app.route('/dashboard/deposit')
def deposit():
    if 'username' not in session:
        return redirect(url_for('login'))
    user = User.query.filter_by(username=session['username']).first()
    accounts = Account.query.filter_by(user_id=user.user_id).all()
    return render_template('deposit.html',accounts=accounts)

@app.route('/dashboard/deposit', methods=['GET', 'POST'])
def deposit_amount():
    
    accounts = Account.query.all()
    
    if request.method == 'POST':
        account_id = request.form.get('account_id') 
        
        amount = Decimal(request.form['amount'])  

        account = Account.query.filter_by(account_id=account_id).first_or_404()
        account.balance += amount

        transactions = Transaction(
            
            account_id=account.account_id,
            amount=amount,
            balance=account.balance,
            transaction_type='Deposit'
        )

        db.session.add(transactions)

        db.session.commit()

        return redirect(url_for('dashboard'))

    return render_template('deposit.html', accounts=accounts, transactions=transactions)

@app.route('/dashboard/withdraw')
def withdraw():
    
    if 'username' not in session:
        return redirect(url_for('login'))
    user = User.query.filter_by(username=session['username']).first()
    accounts = Account.query.filter_by(user_id=user.user_id).all()
    return render_template('withdraw.html',accounts=accounts)

@app.route('/dashboard/withdraw', methods=['GET', 'POST'])
def withdraw_amount():
    accounts = Account.query.all()
    

    if request.method == 'POST':
        account_id = request.form.get('account_id') 
        
        amount = Decimal(request.form['amount'])  

        account = Account.query.filter_by(account_id=account_id).first_or_404()
        
        account.balance -= amount

        transactions = Transaction(
            
            account_id=account.account_id,
            amount=amount,
            balance=account.balance,
            transaction_type='Withdraw'
        )

        db.session.add(transactions)
        db.session.commit()

        return redirect(url_for('dashboard'))


    return render_template('withdraw.html', accounts=accounts, transactions=transactions)


@app.route('/reg',methods=['GET','POST'])
def register():
    if request.method == 'POST':
        fullname = request.form['fullname']
        mailid = request.form['mailid']
        phoneno = request.form['phoneno']
        desiredUsername = request.form['desiredUsername']
        password = request.form['password']
        confirmpassword = request.form['confirmpassword']
        if password != confirmpassword:
            return "Passwords do not match!"
        new_user = User(
                full_name=fullname,
                email=mailid,
                phone_number=phoneno,
                username=desiredUsername,
                password_hash=password
            )
        

        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/pfmanage')
def profile_manage():
    return render_template("profilemanagement.html")

@app.route('/fpassword', methods=['GET', 'POST'])
def forget_password():
    if request.method == 'POST':
        username = request.form['username']
        new_password = request.form['newPassword']
        confirm_password = request.form['confirmNewPassword']

        if new_password != confirm_password:
            return "Passwords do not match!"

        user = User.query.filter_by(username=username).first()

        if user:
            user.password_hash = new_password 
            db.session.commit()
            return "Password updated successfully!"
        else:
            return "User not found!"

    return render_template("updatepassword.html")

@app.route('/pfmanage/upcontact', methods=['GET', 'POST'])
def update_contact():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['mailid']
        phone = request.form['phoneno']

        user = User.query.filter_by(username=username).first()

        if user:
            user.email = email
            user.phone_number = phone
            db.session.commit()
            return "Contact details updated successfully!"
        else:
            return "User not found!"

    return render_template("updatecontact.html")

@app.route('/logout')
def logout():
    session.pop('username', None)  # Remove session variable
    return redirect(url_for('login'))

if __name__ == '__main__':
    with app.app_context():  
        #db.create_all()
        #seed_data() 
        app.run(debug=True)
    