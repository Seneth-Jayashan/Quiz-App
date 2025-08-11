import React, { useState } from "react";
import { motion } from "framer-motion";

const plans = [
  {
    id: 1,
    name: "Basic",
    price: "$9.99",
    features: ["Access to basic quizzes", "Standard support", "Limited attempts"],
  },
  {
    id: 2,
    name: "Pro",
    price: "$19.99",
    features: ["All Basic features", "Priority support", "Unlimited attempts", "Custom reports"],
  },
  {
    id: 3,
    name: "Enterprise",
    price: "Contact Us",
    features: ["All Pro features", "Dedicated account manager", "Team access", "Custom integrations"],
  },
];

export default function Subscriptions() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelect = (plan) => {
    setSelectedPlan(plan);
    alert(`You selected the ${plan.name} plan.`);
    // Implement payment or subscription logic here
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-start pt-16 px-4 text-gray-900 dark:text-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-8">Subscription Plans</h1>

      <div className="grid gap-8 w-full max-w-5xl sm:grid-cols-1 md:grid-cols-3">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.05 }}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col justify-between border-2 ${
              selectedPlan?.id === plan.id ? "border-blue-600 dark:border-blue-400" : "border-transparent"
            } transition-colors duration-300`}
          >
            <div>
              <h2 className="text-2xl font-semibold mb-4">{plan.name}</h2>
              <p className="text-3xl font-bold mb-6">{plan.price}</p>
              <ul className="mb-6 list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSelect(plan)}
              className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              {selectedPlan?.id === plan.id ? "Selected" : "Choose Plan"}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
