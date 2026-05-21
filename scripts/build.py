from bs4 import BeautifulSoup, Tag
from bs4.formatter import HTMLFormatter
from typing import Tuple, TypeAlias, Optional
from argparse import ArgumentParser
from git import Repo, InvalidGitRepositoryError

INDENT_LEVEL=4

File: TypeAlias = Tuple[str, str]

def get_short_url():
    try:
        repo = Repo(".")
        
        # No one uses anything other than origin, this is fine
        url = repo.remotes.origin.url
        
        # Could probably use a regex here but I'd honestly rather die
        short_url = url.split("github.com/")[-1].split("github.com:")[-1].replace(".git", "")
        return short_url
    except Exception as e:
        print(f"Found a Git repo, but failed to origin url: {e}")

def in_repo() -> bool:
    try:
        # I really hate this pattern of try..except for simple conditions
        _ = Repo(".", search_parent_directories=True)
        return True
    except InvalidGitRepositoryError:
        return False

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
        output = soup.prettify(formatter=fmt)
        f.write(output) # type: ignore

def append_head(soup: BeautifulSoup, tag: Tag) -> None:
    head = soup.find("head")
    if head is not None and isinstance(head, Tag):
        head.append(tag)

def parse_links(soup: BeautifulSoup) -> list[File]:
    css_files: list[str] = []

    # Get all referenced stylesheets
    for link in soup.find_all("link", rel="stylesheet"):
        if isinstance(link, Tag):
            href = str(link.get('href'))
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
        if isinstance(script, Tag):
            src = str(script.get("src"))
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
            # I think indent will always be 3? I could be wrong
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
            
            append_head(soup, link)

    if style_el.string == "" and jsdelivr_repo is None:
        return
    append_head(soup, style_el)

def add_scripts(soup: BeautifulSoup, jsdelivr_repo: Optional[str] = None) -> None:
    scripts: list[File] = parse_scripts(soup)

    for script in scripts:
        script_tag = soup.new_tag("script")
        if script_tag is not Tag:
            return
        if jsdelivr_repo is None:
            indent = (" "*INDENT_LEVEL)*3
            comment = f"// {script[0].removeprefix("./")}"
            contents = script[1].replace("\n", f"\n{indent}")
            full = f"\n{indent}{comment}\n\n{indent}{contents}"

            script_tag.string = full
        else:
            url = jsdelivr_url(jsdelivr_repo, script[0])
            script_tag["defer"] = None
            script_tag["src"] = url

        body = soup.find("body")

        if body is not None and isinstance(body, Tag):
            if jsdelivr_repo is None and script_tag.string == "":
                continue
            body.append(script_tag)

def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("input", help="Filepath of the HTML file to use as a basis for compilation")
    parser.add_argument("--output", "-o", default="index.min.html", help="Where to write the compiled HTML")
    parser.add_argument("--github-url", "-gh", help="A github short url from which to pull CSS/JS files from via JSDelivr CDN. If provided, CSS/JS files will be embedded as JSDelivr links")
    parser.add_argument("--local", "-l", action="store_true", help="By default, if the current working directory is in a git repository, CSS/JS files will automatically be converted to JSDelivr links. Enabling this option forces all CSS/JS to be embedded directly")
    parser.add_argument("--gh-scripts-only", "-So", action="store_true", help="If using JSDelivr, only embed JS files as JSDelivr links, and embed all CSS normally")
    parser.add_argument("--gh-css-only", "-Co", action="store_true", help="If using JSDelivr, only embed CSS files as JSDelivr links, and embed all JS normally")

    args = parser.parse_args()
    
    inp_file = args.input
    output = args.output
    github_url = args.github_url
    use_local = args.local
    scripts_only = args.gh_scripts_only
    css_only = args.gh_css_only
    
    # Automatically detect repo
    if in_repo():
        url = get_short_url()
        print(f"Found Github repository: {url}")
        if github_url is None:
            github_url = url
            
    if use_local == True:
        github_url = None

    html = read_file(inp_file)
    soup = BeautifulSoup(html, "html.parser")

    add_css(soup, github_url if css_only == True else None)
    add_scripts(soup, github_url if scripts_only == True else None)

    write_output(output, soup)

if __name__ == "__main__":
    main()