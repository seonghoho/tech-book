const Footer = () => {
  return (
    <footer className="w-full py-6 border-t border-border bg-white dark:bg-dark text-center text-sm text-gray-800 dark:text-gray-200">
      <p>
        © {new Date().getFullYear()} TechBook. All rights reserved.{" | "}
        <a
          href="https://github.com/seonghoho"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-black dark:hover:text-white"
        >
          GitHub
        </a>
        {" | "}
        <a
          href="/about"
          className="underline hover:text-black dark:hover:text-white"
        >
          Who Am I?
        </a>
      </p>
    </footer>
  );
};

export default Footer;
