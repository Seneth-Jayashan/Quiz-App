import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-6 px-4 text-center text-gray-600 w-full">
      <div className="max-w-4xl mx-auto">

        <p className="mb-2">
          Create your own Quiz at{" "}
          <a
            href="/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Quiz App
          </a>
        </p>
        <p className="text-xs">
          Developed by S JAY Web Solutions (Pvt) Ltd
        </p>
      </div>
    </footer>
  );
}
