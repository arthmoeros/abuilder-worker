@echo off
move .gitignore .gitignore_origin
move .gitignore_heroku .gitignore
call npm run build
git --git-dir=.git_heroku add .
git --git-dir=.git_heroku commit -m "heroku deploy"
git --git-dir=.git_heroku push heroku master -f
move .gitignore .gitignore_heroku
move .gitignore_origin .gitignore