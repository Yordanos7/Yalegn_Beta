import React from "react";

const FAQPage = () => {
  const faqs = [
    {
      question:
        "How does the app address the unique challenges faced by people in Ethiopia?",
      answer:
        "Our app is designed with the Ethiopian context in mind, focusing on local needs such as connecting job seekers with opportunities, facilitating marketplace transactions, and providing relevant information tailored to the region. We aim to bridge gaps in access to services and information, empowering individuals and communities.",
    },
    {
      question:
        "What kind of job opportunities can I find through this app in Ethiopia?",
      answer:
        "The app features a wide range of job opportunities across various sectors in Ethiopia, from skilled labor and professional roles to freelance gigs. We partner with local businesses and organizations to ensure a diverse and relevant selection of listings for our users.",
    },
    {
      question: "How does the marketplace feature work for Ethiopian users?",
      answer:
        "Our marketplace allows users to buy and sell goods and services locally within Ethiopia. It provides a platform for small businesses and individuals to reach a wider audience, promoting local commerce and economic growth. Users can easily list items, browse categories, and connect with buyers/sellers securely.",
    },
    {
      question: "Is the app available in local Ethiopian languages?",
      answer:
        "Yes, we are committed to making our app accessible to all Ethiopians. We support multiple local languages, including Amharic, Oromo, and Tigrinya, to ensure a seamless and inclusive user experience. Users can select their preferred language in the settings.",
    },
    {
      question:
        "How does the app ensure the safety and security of its users in Ethiopia?",
      answer:
        "User safety and data security are our top priorities. We implement robust security measures, including data encryption, secure payment gateways for marketplace transactions, and a verification process for job listings and user profiles. We also provide clear guidelines and support channels for reporting any concerns.",
    },
    {
      question:
        "What are the benefits of using this app for individuals and businesses in Ethiopia?",
      answer:
        "For individuals, the app offers access to diverse job opportunities, a vibrant local marketplace, and valuable information, helping them improve their livelihoods. For businesses, it provides a platform to find skilled talent, expand their customer base, and contribute to the local economy, fostering growth and innovation.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-10">
        Frequently Asked Questions
      </h1>

      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div key={index} className="mb-6 p-6 bg-card rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {faq.question}
            </h2>
            <p className="text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
