const themeInitializerScript = `
  (function () {
    var root = document.documentElement;

    try {
      var storedTheme = window.localStorage.getItem("theme");
      var nextTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";

      root.classList.toggle("dark", nextTheme === "dark");
      root.style.colorScheme = nextTheme;
    } catch (error) {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  })();
`;

export default function ThemeInitializer() {
  return <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />;
}
