document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const editor = document.getElementById('editor');
    const fab = document.getElementById('fab');

    // Dark Mode
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Modals
    const aboutModal = document.getElementById('aboutModal');
    const showAboutModalBtn = document.getElementById('showAboutModal');
    const closeAboutModalBtn = document.getElementById('closeAboutModal');

    const messageModal = document.getElementById('messageModal');
    const messageModalText = document.getElementById('messageModalText');
    const messageModalOkBtn = document.getElementById('messageModalOk');
    const messageModalConfirmBtn = document.getElementById('messageModalConfirm');
    const messageModalCancelBtn = document.getElementById('messageModalCancel');


    // Menu buttons and dropdowns
    const menuButtons = document.querySelectorAll('.menu-button');
    const dropdowns = document.querySelectorAll('.dropdown-content');

    // File Menu items
    const newNoteBtn = document.getElementById('newNote');
    const saveNoteBtn = document.getElementById('saveNote');
    const downloadTxtBtn = document.getElementById('downloadTxt');
    const printNoteBtn = document.getElementById('printNote');

    // Insert Menu items
    const insertDateTimeBtn = document.getElementById('insertDateTime');
    const insertDividerBtn = document.getElementById('insertDivider');

    // Format Menu items
    const fontFamilySelect = document.getElementById('fontFamily');
    const fontSizeSelect = document.getElementById('fontSize');
    const textColorInput = document.getElementById('textColor');

    // View Menu items
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetZoomBtn = document.getElementById('resetZoom');
    const toggleFullscreenBtn = document.getElementById('toggleFullscreen');

    // --- State ---
    let currentEditorZoom = 100; // Percentage
    const EDITOR_ZOOM_STEP = 10;
    const MIN_ZOOM = 50;
    const MAX_ZOOM = 200;
    let confirmCallback = null;
    let cancelCallback = null;


    // --- Debounce function ---
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // --- Editor Content Persistence (localStorage) ---
    const STORAGE_KEY_CONTENT = 'notepadContent';
    const STORAGE_KEY_DARK_MODE = 'notepadDarkMode';
    const STORAGE_KEY_ZOOM = 'notepadZoomLevel';

    function loadContent() {
        const savedContent = localStorage.getItem(STORAGE_KEY_CONTENT);
        if (savedContent) {
            editor.innerHTML = savedContent;
        }
        updateEditorPlaceholder();
    }

    function saveContent() {
        localStorage.setItem(STORAGE_KEY_CONTENT, editor.innerHTML);
        // console.log("Content saved to localStorage"); // Keep for debugging if needed
    }

    const debouncedSaveContent = debounce(saveContent, 1000);

    editor.addEventListener('input', () => {
        debouncedSaveContent();
        updateEditorPlaceholder();
    });

    function updateEditorPlaceholder() {
        // The CSS :empty:before selector handles the placeholder visibility.
        // This function could be used for more complex placeholder logic if needed in the future.
        // For now, it ensures the editor state is checked on input.
    }


    // --- Dark Mode ---
    function applyDarkMode(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️ Toggle Light Mode';
        } else {
            document.body.classList.remove('dark-mode');
            darkModeToggle.textContent = '🌓 Toggle Dark Mode';
        }
        textColorInput.value = isDark ? '#e0e0e0' : '#000000'; // Update color picker default
    }

    function toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem(STORAGE_KEY_DARK_MODE, isDark);
        applyDarkMode(isDark);
    }

    function loadDarkModePreference() {
        const savedDarkMode = localStorage.getItem(STORAGE_KEY_DARK_MODE);
        if (savedDarkMode !== null) {
            applyDarkMode(savedDarkMode === 'true');
        } else {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                applyDarkMode(true);
            } else {
                applyDarkMode(false);
            }
        }
    }
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // --- Custom Message/Confirm Modal Logic ---
    function showCustomMessage(message) {
        messageModalText.innerHTML = message; // Use innerHTML to allow basic formatting if needed
        messageModalOkBtn.classList.remove('hidden');
        messageModalConfirmBtn.classList.add('hidden');
        messageModalCancelBtn.classList.add('hidden');
        messageModal.style.display = 'flex'; // Use flex for centering
    }

    messageModalOkBtn.addEventListener('click', () => {
        messageModal.style.display = 'none';
    });

    function showCustomConfirm(message, onConfirm, onCancel) {
        messageModalText.innerHTML = message; // Use innerHTML
        messageModalOkBtn.classList.add('hidden');
        messageModalConfirmBtn.classList.remove('hidden');
        messageModalCancelBtn.classList.remove('hidden');
        messageModal.style.display = 'flex'; // Use flex for centering
        confirmCallback = onConfirm;
        cancelCallback = onCancel;
    }

    messageModalConfirmBtn.addEventListener('click', () => {
        messageModal.style.display = 'none';
        if (typeof confirmCallback === 'function') {
            confirmCallback();
        }
        confirmCallback = null;
        cancelCallback = null;
    });

    messageModalCancelBtn.addEventListener('click', () => {
        messageModal.style.display = 'none';
        if (typeof cancelCallback === 'function') {
            cancelCallback();
        }
        confirmCallback = null;
        cancelCallback = null;
    });


    // --- Menu Dropdown Logic ---
    menuButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const dropdownId = button.getAttribute('data-dropdown');
            const currentDropdown = document.getElementById(dropdownId);

            dropdowns.forEach(dd => {
                if (dd.id !== dropdownId && dd.style.display === 'block') {
                    dd.style.display = 'none';
                }
            });
            currentDropdown.style.display = currentDropdown.style.display === 'block' ? 'none' : 'block';
        });
    });

    window.addEventListener('click', (event) => {
        // Close dropdowns
        if (!event.target.matches('.menu-button')) {
            dropdowns.forEach(dropdown => {
                if (!dropdown.contains(event.target)) {
                    dropdown.style.display = 'none';
                }
            });
        }
        // Close modals if clicked on modal backdrop
        if (event.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
        if (event.target === messageModal) {
            messageModal.style.display = 'none';
            // If it's a confirm dialog and user clicks outside, treat as cancel
            if (messageModalConfirmBtn.classList.contains('hidden') === false && typeof cancelCallback === 'function') {
                cancelCallback();
            }
            confirmCallback = null;
            cancelCallback = null;
        }
    });

    // --- File Menu Actions ---
    newNoteBtn.addEventListener('click', () => {
        const performNewNote = () => {
            editor.innerHTML = '';
            saveContent();
            updateEditorPlaceholder();
            closeAllDropdowns();
        };

        if (editor.innerHTML.trim() !== "") {
            showCustomConfirm(
                "Are you sure you want to start a new note? Unsaved changes will be lost if not explicitly saved.",
                performNewNote,
                () => { closeAllDropdowns(); }
            );
        } else {
            performNewNote();
        }
    });

    saveNoteBtn.addEventListener('click', () => {
        saveContent();
        showCustomMessage('Note saved to local storage!');
        closeAllDropdowns();
    });

    downloadTxtBtn.addEventListener('click', () => {
        const text = editor.innerText;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const anchor = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        anchor.download = `MyNotepad-${timestamp}.txt`;
        anchor.href = URL.createObjectURL(blob);
        anchor.click();
        URL.revokeObjectURL(anchor.href);
        anchor.remove();
        closeAllDropdowns();
    });

    printNoteBtn.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write('<html><head><title>Print</title>');
        doc.write('<style> body { font-family: ' + getComputedStyle(editor).fontFamily + '; font-size: ' + getComputedStyle(editor).fontSize + '; line-height: ' + getComputedStyle(editor).lineHeight + '; color: ' + getComputedStyle(editor).color + '; } hr { margin: 1em 0; border: 0; border-top: 1px solid #ccc;} img {max-width: 100%; height: auto;} </style>');
        doc.write('</head><body>' + editor.innerHTML + '</body></html>');
        doc.close();

        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 500);
        closeAllDropdowns();
    });

    // --- Edit Menu Actions (using execCommand) ---
    document.querySelectorAll('#editDropdown button[data-command]').forEach(button => {
        button.addEventListener('click', () => {
            const command = button.getAttribute('data-command');
            try {
                if (command === 'paste') {
                    // For paste, it's better to let the browser handle it or use Clipboard API
                    // execCommand('paste') can be unreliable and have security restrictions
                    // For simplicity, we'll rely on browser's default paste behavior into contentEditable
                    // If specific paste handling is needed, Clipboard API is the modern way.
                    // For now, we let it try, but it might not work in all contexts without user interaction.
                    navigator.clipboard.readText()
                        .then(text => {
                            if (text) insertHtmlAtCursor(text.replace(/\n/g, '<br>'));
                        })
                        .catch(err => {
                            console.warn('Failed to read clipboard contents: ', err);
                            // Fallback or notify user that direct paste might be needed
                            document.execCommand(command, false, null); // Try old method
                        });
                } else {
                    document.execCommand(command, false, null);
                }
            } catch (e) {
                console.error("Error executing command: ", command, e);
                showCustomMessage("Could not perform action: " + command);
            }
            editor.focus();
            closeAllDropdowns();
        });
    });

    // --- Insert Menu Actions ---
    function insertHtmlAtCursor(html) {
        editor.focus();
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const el = document.createElement("div");
            el.innerHTML = html;
            const frag = document.createDocumentFragment();
            let node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            if (lastNode) {
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
        updateEditorPlaceholder();
        saveContent(); // Save after insertion
    }

    insertDateTimeBtn.addEventListener('click', () => {
        const now = new Date();
        const dateTimeString = now.toLocaleString();
        insertHtmlAtCursor(dateTimeString + "&nbsp;");
        closeAllDropdowns();
    });

    insertDividerBtn.addEventListener('click', () => {
        insertHtmlAtCursor('<hr><p></p>'); // Add a paragraph after HR for easier typing
        // Move cursor into the new paragraph
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const newP = editor.querySelector('p:empty'); // Find the last empty p
            if (newP) {
                range.setStart(newP, 0);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
        closeAllDropdowns();
    });

    // --- Format Menu Actions ---
    fontFamilySelect.addEventListener('change', (e) => {
        document.execCommand('fontName', false, e.target.value);
        editor.style.fontFamily = e.target.value; // Also set base style for new content
        editor.focus();
    });

    fontSizeSelect.addEventListener('change', (e) => {
        document.execCommand('fontSize', false, e.target.value);
        editor.focus();
    });

    document.querySelectorAll('#formatDropdown button[data-command]').forEach(button => {
        button.addEventListener('click', () => {
            const command = button.getAttribute('data-command');
            document.execCommand(command, false, null);
            editor.focus();
        });
    });

    textColorInput.addEventListener('input', (e) => {
        document.execCommand('foreColor', false, e.target.value);
        // editor.focus(); // Focus can be lost from color picker, might be okay
    });
    textColorInput.addEventListener('change', (e) => { // Ensure final selection is applied
        document.execCommand('foreColor', false, e.target.value);
        editor.focus();
    });


    // --- View Menu Actions ---
    function updateEditorZoom() {
        editor.style.zoom = `${currentEditorZoom}%`;
        localStorage.setItem(STORAGE_KEY_ZOOM, currentEditorZoom);
    }

    function loadZoomLevel() {
        const savedZoom = localStorage.getItem(STORAGE_KEY_ZOOM);
        if (savedZoom) {
            currentEditorZoom = parseInt(savedZoom, 10);
            if (isNaN(currentEditorZoom) || currentEditorZoom < MIN_ZOOM || currentEditorZoom > MAX_ZOOM) {
                currentEditorZoom = 100;
            }
        } else {
            currentEditorZoom = 100;
        }
        updateEditorZoom();
    }

    zoomInBtn.addEventListener('click', () => {
        if (currentEditorZoom < MAX_ZOOM) {
            currentEditorZoom += EDITOR_ZOOM_STEP;
            updateEditorZoom();
        }
        closeAllDropdowns();
    });

    zoomOutBtn.addEventListener('click', () => {
        if (currentEditorZoom > MIN_ZOOM) {
            currentEditorZoom -= EDITOR_ZOOM_STEP;
            updateEditorZoom();
        }
        closeAllDropdowns();
    });

    resetZoomBtn.addEventListener('click', () => {
        currentEditorZoom = 100;
        updateEditorZoom();
        closeAllDropdowns();
    });

    toggleFullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                showCustomMessage(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        closeAllDropdowns();
    });

    // --- Help Menu / Modal Logic ---
    showAboutModalBtn.addEventListener('click', () => {
        aboutModal.style.display = 'flex'; // Use flex for centering
        closeAllDropdowns();
    });
    closeAboutModalBtn.addEventListener('click', () => {
        aboutModal.style.display = 'none';
    });
    // Window click listener already handles closing About modal

    // --- Floating Action Button (FAB) ---
    fab.addEventListener('click', () => {
        newNoteBtn.click();
    });

    // --- Utility function to close all dropdowns ---
    function closeAllDropdowns() {
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }

    // --- Initializations ---
    loadContent();
    loadDarkModePreference(); // This will also set initial textColorInput.value
    loadZoomLevel();
    updateEditorPlaceholder();

    editor.style.fontFamily = fontFamilySelect.value;

});
