import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import Dashboard from "./Dashboard";
import AddAccount from "./AddAccount";
import AccountDetails from "./AccountDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/add_account" element={<AddAccount />} />
        <Route path="/account/:accountId" element={<AccountDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;