把本壓縮檔解壓縮後的內容，依相同路徑覆蓋到專案根目錄（基於 main 1506b5d，即工程師 PR #5 合併後）。
共 15 個檔案：index.html（已建置好）、src/ 下的修改與新增檔、test/sentence-opts.mjs、package.json、CLAUDE.md、README.md、功能手冊。
覆蓋後若有 Node：node build.mjs --check 應顯示「index.html 與 src/ 同步」。
注意：若你們的 main 在 1506b5d 之後又有別的修改，請不要整檔覆蓋 index.html 與有修改的檔案，改用比對工具合併，並重新執行 node build.mjs。
