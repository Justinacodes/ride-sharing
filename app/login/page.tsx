"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { account } from "../appwrite";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";


const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const LoginPage = () => {
  const router = useRouter();
  const { user, setUser, clearUser } = useUserStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      try {
        await account.deleteSession('current');
      } catch (e) {
        console.log("No existing session to delete");
      }
  
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      setUser(user);
      router.push("/dashboard");
    } catch (err) {
      alert("Login failed. Please check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // const logout = async () => {
  //   try {
  //     await account.deleteSession("current");
  //     clearUser();
  //   } catch (error) {
  //     console.error("Logout failed:", error);
  //   }
  // };

  const onSubmit = async (data: FormData) => {
    await login(data.email, data.password);
  };

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        {/* <p className="mb-4 text-lg">Logged in as <strong>{user.name}</strong></p>
        <button
          type="button"
          onClick={logout}
          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Logout
        </button> */}
        
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <button className="p-3 bg-blue-600 text-white text-center mb-5 rounded-lg hover:bg-blue-700">
        RideCo
      </button>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Login to Continue</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("email")}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("password")}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

          <button
            type="submit"
            className="w-full p-2 bg-black text-white rounded-lg hover:bg-gray-800"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center my-2">Or login with</p>
        <button className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Continue with Facebook
        </button>
        <button className="w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 mt-2">
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
