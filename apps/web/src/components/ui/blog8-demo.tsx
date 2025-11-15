import { Blog8 } from "./blog8";

const demoData = {
  heading: "Yalegn Insights & Updates",
  description:
    "Stay informed with the latest news, features, and success stories from the Yalegn platform. Discover how we're connecting talent with opportunities.",
  posts: [
    {
      id: "post-1",
      title: "Yalegn's New Matching Algorithm: Connecting You Faster",
      summary:
        "Explore the advancements in Yalegn's AI-powered matching algorithm, designed to connect freelancers with the perfect jobs and clients with ideal talent more efficiently.",
      label: "Platform Update",
      author: "Yalegn Team",
      published: "10 Nov 2025",
      url: "/marketplace",
      image:
        "https://shega.co/_next/image?url=https%3A%2F%2Fshegastrpool.blob.core.windows.net%2Fmedia-prod%2Fmedia-prod%2FTIFA_1024x683_1e2df78e0c.webp&w=1920&q=75",
      tags: ["AI", "Matching", "Features"],
    },
    {
      id: "post-2",
      title: "Success Story: How Sarah Found Her Dream Project on Yalegn",
      summary:
        "Read about Sarah, a freelance designer, and her journey to finding a fulfilling project and building a successful career through the Yalegn platform.",
      label: "Success Story",
      author: "Yalegn Community",
      published: "05 Nov 2025",
      url: "/marketplace",
      image:
        "https://ethiopiarealty.com/wp-content/uploads/2024/10/Full-Guide-on-How-to-Become-a-Freelancer-in-Ethiopia.jpg",
      tags: ["Freelancer", "Client", "Testimonial"],
    },
  ],
};

function Blog8Demo() {
  return <Blog8 {...demoData} />;
}

export { Blog8Demo };
