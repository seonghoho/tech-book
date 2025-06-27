const Footer = () => {
  return (
    <footer className="w-full py-8 border-t border-border bg-white dark:bg-dark text-center text-sm text-gray-800 dark:text-gray-200">
      <div className="flex flex-col gap-1">
        <div>© {new Date().getFullYear()} TechBook. All rights reserved.</div>
        <div>
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
        </div>
      </div>
    </footer>
  );
};

export default Footer;
