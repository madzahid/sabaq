# GitHub par push karne ke liye

Repo pehle se banaya hua hai — git init ho chuka, sab files commit ho chuki hain.
Bas apne Mac ke Terminal mein yeh chalayein:

## Agar aap ke paas gh CLI hai (aasan tareeqa)

    cd ~/Downloads/sabaq
    gh repo create sabaq --private --source=. --remote=origin --push

Bas. Private repo ban jayega aur code chala jayega.

## Agar gh nahi hai

1. github.com par jayein → New repository
2. Naam: `sabaq` · **Private** chunein
3. README/gitignore/licence **na** lagayein (pehle se maujood hain)
4. Create dabayein, phir Terminal mein:

```
cd ~/Downloads/sabaq
git remote add origin https://github.com/madzahid/sabaq.git
git push -u origin main
```

## Push ke baad

    npm install
    npm run dev

Browser mein safha 363 khul jayega.

Note: `data/source/*.db` gitignore mein hain (woh QUL ka data hai, aap ka nahi).
Bani hui `public/data/quran.sqlite` commit ho chuki hai, is liye app foran chalti hai.
