import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function AccountDetails() {
  const { accountId } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/account/${accountId}`, {
        method:"GET",
        headers: { "Content-Type": "application/json" },
        credentials:"include"
    })
      .then((res) => res.json())
      .then((data) => {
        setAccount(data.account);
        setTransactions(data.transactions);
        setLoading(false);
     
    }
    
    )

      .catch((err) => {
        console.error("Error fetching account:", err);
        setLoading(false);
      });
  }, [accountId]);

  

  if (loading) return <p>Loading account details...</p>;
  if (!account) return <p>Account not found.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-center mb-4">
        {account.account_type} Account
      </h2>

      <p className="text-lg">
        <strong>Account Number:</strong> {account.account_number}
      </p>
      <p className="text-lg mb-6">
        <strong>Balance:</strong> ₹{account.balance}
      </p>

      <h3 className="text-xl font-semibold mb-2">Transaction History</h3>
      {transactions.length > 0 ? (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-2">Date</th>
              <th className="p-2">Type</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{txn.timestamp}</td>
                <td className="p-2">{txn.transaction_type}</td>
                <td className="p-2">₹{txn.amount}</td>
                <td className="p-2">{txn.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center">No transactions found.</p>
      )}

      <div className="text-center mt-6">
        <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default AccountDetails;
