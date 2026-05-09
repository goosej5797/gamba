import re

def main():
    print(isPalindrome("A man, a plan, a canal: Panama"))

def isPalindrome(s: str) -> bool:
    clean = re.sub(r'[^a-zA-Z0-9]', '', s)
    cleanStr = clean.strip().lower()

    for index, x in enumerate(cleanStr):
        print(x + " - " + cleanStr[-index])

        if x == cleanStr[-index]:
            continue
        else:
            return False
    return True
    

if __name__ == "__main__":
    main()