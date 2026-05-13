from bs4 import BeautifulSoup
from bs4.formatter import HTMLFormatter

INDENT_LEVEL=4

class CSSFile:
    def __init__(self, fname: str, contents: str) -> None:
        self.file_name = fname
        self.contents = contents

class JSFile:
    def __init__(self, fname: str, contents: str) -> None:
        self.file_name = fname
        self.contents = contents

def read_file(fp: str) -> str:
    with open(fp, "r") as f:
        return f.read()

def write_output(out: str, soup: BeautifulSoup) -> None:
    with open(out, "w") as f:
        fmt = HTMLFormatter(indent=INDENT_LEVEL)
        f.write(soup.prettify(formatter=fmt))

def parse_links(soup: BeautifulSoup) -> list[CSSFile]:
    css_files: list[str] = []

    # Get all referenced stylesheets
    for link in soup.find_all("link", rel="stylesheet"):
        css_files.append(link["href"])
        link.decompose()
    
    styles = []

    for file in css_files:
        contents = read_file(file)
        styles.append(CSSFile(file, contents))

    return styles

def parse_scripts(soup: BeautifulSoup) -> list[JSFile]:
    js_files: list[str] = []

    for script in soup.find_all("script"):
        src = script["src"]
        if src:
            # Make sure src is reference to file
            if not (src.startswith("http") or src.startswith("//")):
                js_files.append(src)
                script.decompose()

    scripts = []

    for file in js_files:
        contents = read_file(file)
        scripts.append(JSFile(file, contents))

    return scripts

def add_css(soup: BeautifulSoup) -> None:
    style_el = soup.new_tag("style")
    style_el.string = ""

    docs = parse_links(soup)

    for doc in docs:
        # Indentation lvl for style tag is usually 3
        indent = (" "*INDENT_LEVEL)*3
        comment = f"/* {doc.file_name} */"
        contents = doc.contents.replace("\n", f"\n{indent}")
        full = f"\n{indent}{comment}\n\n{indent}{contents}\n\n"

        style_el.string += full

    soup.find("head").append(style_el)

def add_scripts(soup: BeautifulSoup) -> None:
    scripts: list[JSFile] = parse_scripts(soup)

    for script in scripts:
        script_tag = soup.new_tag("script")

        indent = (" "*INDENT_LEVEL)*3
        comment = f"// {script.file_name.removeprefix("./")}"
        contents = script.contents.replace("\n", f"\n{indent}")
        full = f"\n{indent}{comment}\n\n{indent}{contents}"

        script_tag.string = full

        soup.find("body").append(script_tag)

def main() -> None:
    html = read_file("index.html")

    soup = BeautifulSoup(html, "html.parser")

    add_css(soup)
    add_scripts(soup)

    write_output("index_out.html", soup)
    
if __name__ == "__main__":
    main()