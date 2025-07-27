import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-6 px-4 text-center text-gray-600">
      <div className="max-w-4xl mx-auto">
        <p className="mb-2">
          We use cookies to provide this service and improve your experience.{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Learn More
          </a>
        </p>

        <p className="mb-2">
          Create your own Quiz at{" "}
          <a
            href="https://www.sjaywebsolitons.lk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Quiz App
          </a>
        </p>

        <p className="text-sm">
          By using Quiz App you accept our terms of use and policies.
        </p>
      </div>
    </footer>
  );
}
