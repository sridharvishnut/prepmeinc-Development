"use client";
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login'); // Redirect to the login page as the default landing
}
