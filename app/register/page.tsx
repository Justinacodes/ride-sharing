"use client";
import React, { useState } from "react";
import { account, ID } from "../appwrite";
import { Models } from "appwrite";

const RegisterPage = () => {
  const [loggedInUser, setLoggedInUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      const user = await account.create(email, password, name);
      setLoggedInUser(user);
    } catch (err) {
      console.error(err);
      setError("Login failed.");
    }
  };

  const register = async () => {
    setLoading(true);
    setError("");
    try {
      await account.create(ID.unique(), email, password, name);
      
      //Instead of logging in again, just fetch the user
      const user = await account.get();
      setLoggedInUser(user);
  
    } catch (err) {
      console.error(err);
      setError("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  
  

  if (loggedInUser) {
    return (
      <div className="p-4">
        <h2 className="text-xl mb-2">Welcome, {loggedInUser.name}!</h2>
        <p>You are now logged in.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="button"
          onClick={register}
          disabled={loading}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
