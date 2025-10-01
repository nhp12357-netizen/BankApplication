from flask import Flask
from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from decimal import Decimal
from flask import jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
app.secret_key = 'your_secret_key'


basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'bank.db')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()  

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
    


@app.route('/api/dashboard')
def api_dashboard():
    
    if 'username' not in session:
        return {"error": "Not logged in"}, 401

    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return {"error": "User not found"}, 404

    accounts = Account.query.filter_by(user_id=user.user_id).all()

    accounts_data = [
        {
            "account_id": a.account_id,
            "account_number": a.account_number,
            "balance": float(a.balance),  # convert Decimal to float
            "created_at": a.created_at.isoformat()
        }
        for a in accounts
    ]

    return jsonify({
        "user": {
            "user_id": user.user_id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "phone_number": user.phone_number
        },
        "accounts": accounts_data
    })

@app.route('/api/reg', methods=['POST'])
def api_register():
    data = request.get_json()  
    fullname = data.get('fullname')
    mailid = data.get('mailid')
    phoneno = data.get('phoneno')
    desiredUsername = data.get('desiredUsername')
    password = data.get('password')
    confirmpassword = data.get('confirmpassword')

    if not all([fullname, mailid, phoneno, desiredUsername, password, confirmpassword]):
        return jsonify({'success': False, 'message': 'All fields are required!'}), 400

    if password != confirmpassword:
        return jsonify({'success': False, 'message': 'Passwords do not match!'}), 400

    existing_user = User.query.filter((User.username == desiredUsername) | (User.email == mailid)).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Username or email already exists!'}), 400

    

    new_user = User(
        full_name=fullname,
        email=mailid,
        phone_number=phoneno,
        username=desiredUsername,
        password_hash=password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'success': True, 'message': 'User registered successfully!'}), 201

@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    if 'username' not in session:
        return {"error": "Unauthorized"}, 401
    user = User.query.filter_by(username=session['username']).first()
    accounts = Account.query.filter_by(user_id=user.user_id).all()
    return {"accounts": [
        {
            "account_id": acc.account_id,
            "account_type": acc.account_type,
            "account_number": acc.account_number,
            "balance": float(acc.balance)
        } for acc in accounts
    ]}

@app.route('/api/deposit', methods=['POST'])
def api_deposit():
    data = request.get_json()
    account_id = data.get("account_id")
    amount = Decimal(data.get("amount"))

    account = Account.query.filter_by(account_id=account_id).first_or_404()
    account.balance += amount

    transaction = Transaction(
        account_id=account.account_id,
        amount=amount,
        balance=account.balance,
        transaction_type='Deposit'
    )
    db.session.add(transaction)
    db.session.commit()

    return {"message": "Deposit successful"}

@app.route('/api/withdraw', methods=['POST'])
def api_withdraw():
    data = request.get_json()
    account_id = data.get("account_id")
    amount = Decimal(data.get("amount"))

    account = Account.query.filter_by(account_id=account_id).first_or_404()
    account.balance -= amount

    transaction = Transaction(
        account_id=account.account_id,
        amount=amount,
        balance=account.balance,
        transaction_type='withdraw'
    )
    db.session.add(transaction)
    db.session.commit()

    return {"message": "Withdraw successful"}

@app.route('/api/add_account', methods=['POST'])
def api_add_account():
    data = request.get_json()  

    if 'username' not in session:
        return {"error": "Unauthorized. Please log in first."}, 401

    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return {"error": "User not found"}, 404


    account_number = data.get('account_number')
    account_type = data.get('account_type')
    balance = data.get('balance', 0.00)  

    if not account_number or not account_type:
        return {"error": "account_number and account_type are required"}, 400

    new_account = Account(
        user_id=user.user_id,
        account_number=account_number,
        account_type=account_type,
        balance=Decimal(balance),
        status='Active',
        created_at=datetime.utcnow()
    )
    db.session.add(new_account)
    db.session.commit()

    accounts = Account.query.filter_by(user_id=user.user_id).all()
    accounts_data = [
        {
            "account_id": a.account_id,
            "account_number": a.account_number,
            "balance": str(a.balance)
        }
        for a in accounts
    ]

    return {
        "message": "Account added successfully",
        "username": user.username,
        "user_id": user.user_id,
        "accounts": accounts_data
    }, 201


@app.route('/api/account/<int:account_id>')
def api_account_details(account_id):
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    user = User.query.filter_by(username=session['username']).first()
    account = Account.query.filter_by(account_id=account_id, user_id=user.user_id).first()
    if not account:
        return jsonify({"error": "Account not found"}), 404
    
    transactions = Transaction.query.filter_by(account_id=account.account_id).order_by(Transaction.timestamp.desc()).all()
    
    return jsonify({
        "account": {
            "account_id": account.account_id,
            "account_type": account.account_type,
            "account_number": account.account_number,
            "balance": account.balance
        },
        "transactions": [
            {
                "timestamp": txn.timestamp.strftime('%Y-%m-%d %H:%M'),
                "transaction_type": txn.transaction_type,
                "amount": txn.amount,
                "description": txn.description or "-"
            }
            for txn in transactions
        ]
    })



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

if __name__ == '__main__':
    with app.app_context():  
        
        app.run(debug=True)
    