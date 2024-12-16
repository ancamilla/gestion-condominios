import React, { useEffect, useState } from "react";

function UserPaymentsPage({ userId }) {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(`/api/payments/user/payments/${userId}`);
        const data = await response.json();
        setPayments(data);
      } catch (error) {
        console.error("Error al obtener pagos:", error);
      }
    };

    fetchPayments();
  }, [userId]);

  return (
    <div>
      <h2>Historial de Pagos</h2>
      <ul>
        {payments.map((payment) => (
          <li key={payment._id}>
            {payment.type}: {payment.amount} - {payment.status} (Vence:{" "}
            {new Date(payment.dueDate).toLocaleDateString()})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserPaymentsPage;
