from bs4 import BeautifulSoup
from bs4.formatter import HTMLFormatter
from typing import Tuple, TypeAlias, Optional
from argparse import ArgumentParser

INDENT_LEVEL=4

File: TypeAlias = Tuple[str, str]

def is_uri(s: str) -> bool:
    return (s is not None) and (s.startswith("http") or s.startswith("//"))

def jsdelivr_url(gh: str, file: str, branch: str = "main") -> str:
    return f"https://cdn.jsdelivr.net/gh/{gh}@{branch}/{file}"

def read_file(fp: str) -> str:
    with open(fp, "r") as f:
        return f.read()

def write_output(out: str, soup: BeautifulSoup) -> None:
    with open(out, "w") as f:
        fmt = HTMLFormatter(indent=INDENT_LEVEL)
        f.write(soup.prettify(formatter=fmt))

def parse_links(soup: BeautifulSoup) -> list[File]:
    css_files: list[str] = []

    # Get all referenced stylesheets
    for link in soup.find_all("link", rel="stylesheet"):
        href = str(link["href"])
        if href:
            # Do not try to embed remote stylesheets
            if not is_uri(href):
                css_files.append(href)
                link.decompose()
    
    styles = []

    for file in css_files:
        try:
            contents = read_file(file)
            styles.append((file, contents))
        except FileNotFoundError:
            print(f"CSS File not found: {file} (does it resolve in your HTML?)")
        except IsADirectoryError:
            print(f"Found <link> reference to directory: {file}")
        except Exception as e:
            print(f"Failed to read CSS file: {file} - {e}")

    return styles

def parse_scripts(soup: BeautifulSoup) -> list[File]:
    js_files: list[str] = []

    for script in soup.find_all("script"):
        src = str(script["src"])
        if src:
            # Make sure src is reference to file
            if not is_uri(src):
                js_files.append(src)
                script.decompose()

    scripts = []

    for file in js_files:
        try:
            contents = read_file(file)
            scripts.append((file, contents))
        except FileNotFoundError:
            print(f"Script file not found: {file} (does it resolve in your HTML?)")
        except IsADirectoryError:
            print(f"Found <script> reference to directory: {file}")
        except Exception as e:
            print(f"Failed to read script file: {file} - {e}")

    return scripts

def add_css(soup: BeautifulSoup, jsdelivr_repo: Optional[str] = None) -> None:
    style_el = soup.new_tag("style")
    style_el.string = ""

    docs = parse_links(soup)

    for doc in docs:
        if jsdelivr_repo is None:
            # Indentation lvl for style tag is usually 3
            indent = (" "*INDENT_LEVEL)*3
            comment = f"/* {doc[0]} */"
            contents = doc[1].replace("\n", f"\n{indent}")
            full = f"\n{indent}{comment}\n\n{indent}{contents}\n\n"

            style_el.string += full
        else:
            url = jsdelivr_url(jsdelivr_repo, doc[0])
            link = soup.new_tag("link")
            link["rel"] = "stylesheet"
            link["type"] = "text/css"
            link["href"] = url

            head = soup.find("head")
            if head is not None:
                head.append(link)

    head = soup.find("head")
    if head is not None:
        head.append(style_el)

def add_scripts(soup: BeautifulSoup, jsdelivr_repo: Optional[str] = None) -> None:
    scripts: list[File] = parse_scripts(soup)

    for script in scripts:
        script_tag = soup.new_tag("script")
        if jsdelivr_repo is None:
            indent = (" "*INDENT_LEVEL)*3
            comment = f"// {script[0].removeprefix("./")}"
            contents = script[1].replace("\n", f"\n{indent}")
            full = f"\n{indent}{comment}\n\n{indent}{contents}"

            script_tag.string = full
        else:
            url = jsdelivr_url(jsdelivr_repo, script[0])
            script_tag["src"] = url

        body = soup.find("body")

        if body is not None and not script_tag.string == "":
            body.append(script_tag)

def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("--output", "-o")
    parser.add_argument("--github-url", "-gh")

    args = parser.parse_args()
    
    inp_file = args.input
    output = args.output
    github_url = args.github_url

    html = read_file(inp_file)
    soup = BeautifulSoup(html, "html.parser")

    add_css(soup, github_url)
    add_scripts(soup, github_url)

    write_output(output if output is not None else "index.html", soup)

if __name__ == "__main__":
    main()