import React from "react";
import { Link } from "react-router-dom";

export default function UnauthorizedScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Session Expired
      </h1>
      <p className="mb-4 text-lg">
        Your session has expired. Please log in again.
      </p>
      <Link
        to="/admin/login"
        className="text-blue-600 underline text-lg hover:text-blue-800"
      >
        Go to Login
      </Link>
    </div>
  );
}
