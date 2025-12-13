// client/src/links.ts
// Updated course link list (Python + cybersecurity resources)
// Replace previous Google links with the user-provided set.

export const LINKS: ReadonlyArray<{ title: string; url: string }> = [
  {
    title: "GeeksforGeeks — Python Programming Language Tutorial",
    url: "https://www.geeksforgeeks.org/python/python-programming-language-tutorial/",
  },
  {
    title: "Edureka — Ethical Hacking Tools (blog)",
    url: "https://www.edureka.co/blog/ethical-hacking-tools/",
  },
  {
    title: "Edureka — What is Cybersecurity (blog)",
    url: "https://www.edureka.co/blog/what-is-cybersecurity/",
  },
  {
    title: "GeeksforGeeks — Python Projects (Beginner to Advanced)",
    url: "https://www.geeksforgeeks.org/python/python-projects-beginner-to-advanced/",
  },
  {
    title: "GeeksforGeeks — Python Data Structures & Algorithms (DSA)",
    url: "https://www.geeksforgeeks.org/dsa/python-data-structures-and-algorithms/",
  },
] as const;