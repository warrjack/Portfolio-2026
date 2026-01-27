# Editing Project Data for Your Portfolio

All project content is now managed in the `data` folder:
- **Main projects:** `data/projects.json`
- **Dynamic/fake projects:** `data/generateProjectData.js`

## Editing or Adding a Main Project
1. Open `data/projects.json`.
2. Each project is a JSON object in the array. Example:

```
{
  "title": "Vibe Coding",
  "subtitle": "Editor Tools",
  "desc": "Extensions for flow state.",
  "stack": ["TypeScript", "VS Code API"],
  "started": "Aug 2024",
  "updated": "Dec 2024",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

3. To add a new project, copy an existing object, edit the fields, and paste it at the end (before the closing `]`).
4. Save the file. The changes will appear automatically in `project.html`.

## Editing Dynamic/Fake Projects
- Open `data/generateProjectData.js`.
- Edit the logic or image URLs as needed. These are used for project IDs beyond the main list.

## Notes
- The order in `projects.json` determines the project ID (0 = first, 1 = second, etc.).
- All fields are required for best display.
- Use valid image URLs for best results.

---

**If you need more help or want to automate project addition, just ask!**
