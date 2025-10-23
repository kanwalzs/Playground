How to Use This GitHub Action

Follow these steps to add the documentation linter to your repository.

1. Create the Workflow Directory
In the root of your repository, create a directory named .github (if it doesn't exist), and then create a workflows directory inside it.

Your repository structure should look like this:
```
.github/
└── workflows/
```


2. Add the Workflow File

Create a new file named ```lint-docs.yml ``` inside the ```.github/workflows``` directory. 
Copy the contents of the Doc Linter Workflow file into this new file.



3. Create the Scripts Directory
In the .github directory, create another new directory named scripts.
Your repository structure should now look like this:
```
.github/
├── scripts/
└── workflows/
    └── lint-docs.yml
```



4. Add the Linter Script

Create a new file named ```lint-codelab.js``` inside the ```.github/scripts``` directory. 
Copy the contents of the Codelab Linter Script file into this new file.


5. Commit the FilesCommit these new files (```.github/workflows/lint-docs.yml``` and ```.github/scripts/lint-codelab.js```) and push them to your repository's default branch (e.g., main or master).


6. Test It
You're all set! The action is now active.
To test it, create a new branch, add or modify a .md file in a way that violates the rules, and open a Pull Request. 
The action will automatically run, fail, and show you a list of errors directly on the Pull Request page.
