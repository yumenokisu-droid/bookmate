
        const MOA_AVATARS = {
            1: 'moa-1.png',
            2: 'moa-2.png',
            3: 'moa-3.png',
            4: 'moa-4.png'
        };

        const AI_AVATAR_SRC = 'assets/profile-moa/ai.png';

        function getAIAvatarHTML(sizeClass = 'w-7 h-7', extraClass = '') {
            return `<div class="${sizeClass} rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-brand-ivory border border-brand-ivoryDark ${extraClass}"><img src="${AI_AVATAR_SRC}" alt="AI 프로필" class="w-full h-full object-cover"></div>`;
        }

        function normalizeAvatarTarget(target) {
            if (!target) return { avatarType: 'moa', avatarId: 1, avatarImage: '' };
            if (!target.avatarType) target.avatarType = 'moa';
            if (!target.avatarId) target.avatarId = 1;
            if (!target.avatarImage) target.avatarImage = '';
            return target;
        }

        function getAvatarHTML(target, sizeClass = 'w-10 h-10', extraClass = '') {
            const avatar = normalizeAvatarTarget(target);
            const name = avatar.nickname || avatar.name || '나';
            const initial = name.charAt(0);
            const base = `${sizeClass} rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-brand-ivory border border-brand-ivoryDark ${extraClass}`;
            if (avatar.avatarType === 'upload' && avatar.avatarImage) {
                return `<div class="${base}"><img src="${avatar.avatarImage}" alt="${name} 프로필" class="w-full h-full object-cover"></div>`;
            }
            const src = MOA_AVATARS[Number(avatar.avatarId || 1)] || MOA_AVATARS[1];
            return `<div class="${base} avatar-moa"><img src="assets/profile-moa/${src}" alt="모아${avatar.avatarId || 1}" class="w-full h-full object-contain p-0.5"></div>`;
        }


        function getAvatarByName(name, sizeClass = 'w-8 h-8') {
            if (state && state.currentUser && name === state.currentUser.nickname) return getAvatarHTML(state.currentUser, sizeClass);
            const pool = (typeof loungeBookmates !== 'undefined' && loungeBookmates.length) ? loungeBookmates : (typeof DEFAULT_BOOKMATES !== 'undefined' ? DEFAULT_BOOKMATES : []);
            const matched = pool.find(m => m.name === name);
            if (matched) return getAvatarHTML(matched, sizeClass);
            const fallbackId = ((String(name || '모아').charCodeAt(0) || 0) % 4) + 1;
            return getAvatarHTML({ name, avatarType: 'moa', avatarId: fallbackId }, sizeClass);
        }

        function updateAvatarPreview(targetId, target) {
            const el = document.getElementById(targetId);
            if (el) el.outerHTML = getAvatarHTML(target, el.className || 'w-10 h-10', 'shadow-inner relative z-10 border-4 border-white');
        }

        function safeSetText(id, text) {
            const el = document.getElementById(id);
            if (el) el.innerText = text;
        }

        function updateHomeBrief() {
            const avatarEl = document.getElementById('home-brief-avatar');
            if (avatarEl) avatarEl.innerHTML = getAvatarHTML(state.currentUser, 'w-14 h-14', 'border-4 border-white shadow-sm');
            safeSetText('home-brief-title', `${state.currentUser.nickname}님, 오늘도 북메이트와 함께할 준비 되셨나요?`);
            const joinedCount = state.gatherings ? state.gatherings.filter(g => g.joined).length : 2;
            safeSetText('home-brief-subtitle', `오늘은 ${Math.max(2, Math.min(joinedCount, 3))}개의 독서모임이 열리고, 북메이트 3명이 새로운 글을 남겼어요.`);
        }

        function openProfileCard() {
            normalizeAvatarTarget(state.currentUser);
            const modal = document.getElementById('profile-card-modal');
            const avatar = document.getElementById('profile-card-avatar');
            if (avatar) avatar.innerHTML = getAvatarHTML(state.currentUser, 'w-24 h-24', 'border-4 border-white shadow-md');
            safeSetText('profile-card-name', state.currentUser.nickname);
            safeSetText('profile-card-library', state.currentUser.library);
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }

        function closeProfileCard() {
            const modal = document.getElementById('profile-card-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        function toggleArchiveDetail(idNum) {
            const detailEl = document.getElementById(`archive-detail-${idNum}`);
            const iconEl = document.getElementById(`archive-icon-${idNum}`);
            if (detailEl) {
                if (detailEl.classList.contains('hidden')) {
                    detailEl.classList.remove('hidden');
                    detailEl.classList.add('animate-fadeIn');
                    if(iconEl) iconEl.style.transform = 'rotate(180deg)';
                } else {
                    detailEl.classList.add('hidden');
                    detailEl.classList.remove('animate-fadeIn');
                    if(iconEl) iconEl.style.transform = 'rotate(0deg)';
                }
            }
        }

        function updateUIProfileData() {
            normalizeAvatarTarget(state.currentUser);
            const nickname = state.currentUser.nickname;
            const library = state.currentUser.library;

            safeSetText('header-nickname', nickname);
            const headerAvatar = document.getElementById('header-avatar-initial');
            if (headerAvatar) headerAvatar.outerHTML = getAvatarHTML(state.currentUser, 'w-6 h-6', 'header-avatar').replace('<div class="', '<div id="header-avatar-initial" class="');
            const profileAvatar = document.getElementById('profile-avatar-initial');
            if (profileAvatar) profileAvatar.outerHTML = getAvatarHTML(state.currentUser, 'w-20 h-20', 'shadow-inner relative z-10 border-4 border-white').replace('<div class="', '<div id="profile-avatar-initial" class="');
            safeSetText('profile-nickname', nickname);
            safeSetText('mypage-library-name', library);
            safeSetText('mypage-info-nickname-span', nickname);

            document.querySelectorAll('.archive-my-nick').forEach(el => el.innerText = nickname);
            document.querySelectorAll('.archive-my-nick-label').forEach(el => el.innerText = `${nickname} (나)`);

            safeSetText('meeting-user-card-name', `${nickname} (나)`);
            safeSetText('meeting-leader-name-span', nickname);
            safeSetText('my-gathering-count-val', state.gatherings.filter(g=>g.joined).length);

            updateHomeBrief();
            renderMyPageNotifications();
            renderMyPageRecentBooks();
            renderReadingTimeline();
            renderMyPageRecentArchives();
        }

        function renderMyPageNotifications() {
            const container = document.getElementById('mypage-notifications-list');
            if (!container) return;
            container.innerHTML = '';
            
            const unreadCount = state.notifications.filter(n => !n.isRead).length;
            const badge = document.getElementById('notification-badge-count');
            if(badge) {
                badge.innerText = unreadCount;
                badge.style.display = unreadCount > 0 ? 'flex' : 'none';
            }

            if (state.notifications.length === 0) {
                container.innerHTML = `<div class="text-xs text-gray-400 text-center py-4">새로운 알림이 없습니다.</div>`;
                return;
            }

            state.notifications.forEach(n => {
                const isReadClass = n.isRead ? 'opacity-60' : '';
                const dotClass = n.isRead ? '' : '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>';
                
                let actions = '';
                if (n.type === 'hello') {
                    actions = `<button onclick="handleNotiAction(${n.id}, 'reply')" class="mt-2 px-3 py-1.5 bg-brand-sageLight text-brand-sageDark hover:bg-brand-sage/20 rounded-lg text-[10px] font-bold transition-colors">인사 답하기</button>`;
                } else if (n.type === 'invite_rx') {
                    actions = `
                        <div class="flex gap-2 mt-2">
                            <button onclick="handleNotiAction(${n.id}, 'accept')" class="px-3 py-1.5 bg-brand-navy hover:bg-brand-navyLight text-white rounded-lg text-[10px] font-bold transition-colors">수락</button>
                            <button onclick="handleNotiAction(${n.id}, 'decline')" class="px-3 py-1.5 bg-brand-ivory text-brand-navy border border-brand-ivoryDark rounded-lg text-[10px] font-bold transition-colors">거절</button>
                        </div>
                    `;
                } else if (n.type === 'invite_tx') {
                    actions = `<div class="mt-2 text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded inline-block bg-gray-50">${n.status}</div>`;
                }

                let profileName = n.from || n.to;
                let directionText = n.type === 'invite_tx' ? '님에게 초대장을 보냈습니다.' : '님이 메시지를 보냈습니다.';
                if (n.type === 'hello') directionText = '님이 인사를 건넸습니다.';

                const div = document.createElement('div');
                div.className = `p-3 rounded-xl border border-brand-ivoryDark bg-brand-ivory/30 ${isReadClass}`;
                div.innerHTML = `
                    <div class="flex gap-3">
                        <div class="relative shrink-0">
                            ${getAvatarHTML({ name: profileName, avatarType: 'moa', avatarId: n.avatarId || ((n.initial || profileName).charCodeAt(0) % 4) + 1 }, 'w-8 h-8')}
                            ${dotClass}
                        </div>
                        <div class="flex-grow">
                            <div class="flex justify-between items-start">
                                <span class="text-[10px] font-bold text-brand-navy block">${profileName} <span class="font-normal text-gray-500">${directionText}</span></span>
                                <span class="text-[9px] text-gray-400 shrink-0">${n.time}</span>
                            </div>
                            <p class="text-[11px] text-gray-600 mt-1 leading-snug">${n.message || `『${n.gathering}』 모임`}</p>
                            ${actions}
                        </div>
                    </div>
                `;
                container.appendChild(div);
            });
        }

        function handleNotiAction(id, actionType) {
            const noti = state.notifications.find(n => n.id === id);
            if(noti) noti.isRead = true;
            
            if (actionType === 'reply') showToast("인사에 따뜻하게 답했습니다!");
            else if (actionType === 'accept') showToast(`모임 초대를 수락했습니다!`);
            else if (actionType === 'decline') showToast("초대를 정중히 거절했습니다.");
            
            renderMyPageNotifications();
        }

        let currentReviewBookId = null;

        function openReviewModal(bookId) {
            const book = state.recentBooks.find(b => b.id === bookId);
            if (!book) return;
            currentReviewBookId = bookId;
            
            safeSetText('review-modal-title', book.title);
            safeSetText('review-modal-author', `${book.author} 저`);
            safeSetText('review-modal-date', book.date);
            document.getElementById('review-modal-content').value = book.review || '';
            
            const coverContainer = document.getElementById('review-modal-cover');
            coverContainer.className = `w-16 h-24 ${book.color} rounded-lg shadow-sm flex items-center justify-center text-white text-[10px] font-bold text-center overflow-hidden shrink-0 relative`;
            coverContainer.innerHTML = `<span class="px-1 break-keep relative z-10">${book.title}</span><div id="review-modal-cover-img" class="absolute inset-0 w-full h-full z-0"></div>`;

            loadReviewModalCover(book.title, 'review-modal-cover-img');

            document.getElementById('review-modal').classList.remove('hidden');
        }

        async function loadReviewModalCover(bookTitle, containerId) {
            const trimmedTitle = (bookTitle || '').trim();
            try {
                const imageUrl = await getBookCoverUrl(trimmedTitle);
                if (imageUrl) {
                    const img = new Image();
                    img.src = imageUrl;
                    img.referrerPolicy = 'no-referrer';
                    img.onload = () => {
                        const container = document.getElementById(containerId);
                        if (container) {
                            container.innerHTML = `<img src="${imageUrl}" class="w-full h-full object-cover" referrerpolicy="no-referrer">`;
                            if (container.previousElementSibling) {
                                container.previousElementSibling.classList.add('hidden');
                            }
                        }
                    };
                    img.onerror = () => console.info('[BOOKMATE Cover] 리뷰 모달 표지 실패:', trimmedTitle, imageUrl);
                }
            } catch (e) {
                console.info('[BOOKMATE Cover] 리뷰 모달 표지 로딩 예외:', trimmedTitle, e);
            }
        }

        function closeReviewModal() {
            document.getElementById('review-modal').classList.add('hidden');
            currentReviewBookId = null;
        }

        function saveReview() {
            if (!currentReviewBookId) return;
            const book = state.recentBooks.find(b => b.id === currentReviewBookId);
            if (book) {
                book.review = document.getElementById('review-modal-content').value.trim();
                showToast("서평이 저장되었습니다.");
                saveAppState();
            }
            closeReviewModal();
        }

        function openAddBookModal() {
            const titleEl = document.getElementById('add-book-title');
            titleEl.value = '';
            titleEl.dataset.bookCover = '';
            titleEl.dataset.bookAuthor = '';
            titleEl.dataset.bookPublisher = '';
            titleEl.dataset.bookPublishedDate = '';
            titleEl.dataset.bookIsbn = '';
            document.getElementById('add-book-author').value = '';
            document.getElementById('add-book-review').value = '';
            document.getElementById('add-book-modal').classList.remove('hidden');
        }

        function closeAddBookModal() {
            document.getElementById('add-book-modal').classList.add('hidden');
        }

        function addNewBook() {
            const title = document.getElementById('add-book-title').value.trim();
            const author = document.getElementById('add-book-author').value.trim() || '미상';
            const review = document.getElementById('add-book-review').value.trim();
            const bookMeta = getSelectedBookMeta('add-book-title');
            
            if (!title) { showToast("책 제목을 입력해주세요.", "error"); return; }

            const colors = ['bg-[#2A4365]', 'bg-[#374151]', 'bg-[#701A24]', 'bg-[#285E61]', 'bg-[#5F8575]', 'bg-[#854D0E]'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            const today = new Date();
            const dateStr = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')} 완독`;

            const newBook = {
                id: Date.now(),
                title: title,
                author: author,
                date: dateStr,
                review: review,
                color: randomColor,
                coverUrl: bookMeta.coverUrl || '',
                publisher: bookMeta.publisher || '',
                publishedDate: bookMeta.publishedDate || '',
                isbn: bookMeta.isbn || ''
            };

            state.recentBooks.unshift(newBook);
            state.currentUser.readBooksCount++;
            
            renderMyPageRecentBooks();
            renderReadingTimeline();
            safeSetText('my-read-count-val', state.currentUser.readBooksCount);
            saveAppState();
            
            closeAddBookModal();
            showToast("완독한 책이 추가되었습니다!");
        }

        function renderMyPageRecentBooks() {
            const container = document.getElementById('mypage-recent-books');
            if (!container) return;
            container.innerHTML = '';
            
            state.recentBooks.forEach(b => {
                const coverId = `recent-book-cover-${b.id}`;
                const div = document.createElement('div');
                div.className = "shrink-0 w-32 snap-start flex flex-col gap-2 relative group";
                div.innerHTML = `
                    <div class="w-full h-44 ${b.color} rounded-xl shadow-sm border border-brand-ivoryDark flex items-center justify-center p-3 text-center relative overflow-hidden cursor-pointer hover:shadow-md transition-all hover:-translate-y-1" onclick="openReviewModal(${b.id})">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div id="${coverId}" class="absolute inset-0 w-full h-full z-0 opacity-40 mix-blend-overlay"></div>
                        <span class="relative z-10 text-white font-serif font-bold text-sm leading-tight drop-shadow-md break-keep">${b.title}</span>
                        
                        <div class="absolute bottom-2 left-0 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <span class="bg-black/50 backdrop-blur-md text-white text-[9px] px-2 py-1 rounded-md font-medium flex items-center gap-1 shadow-sm">
                                <i data-lucide="edit-3" class="w-3 h-3"></i> 서평 쓰기
                            </span>
                        </div>
                    </div>
                    <div>
                        <span class="block text-[11px] font-bold text-brand-navy truncate" title="${b.title}">${b.title}</span>
                        <span class="block text-[9px] text-gray-500 truncate">${b.date}</span>
                    </div>
                `;
                container.appendChild(div);

                loadMyPageRecentBookCover(b.title, coverId, b.coverUrl, b);
            });
            lucide.createIcons();
        }

        function parseBookDateToMonth(dateText) {
            const match = String(dateText || '').match(/(20\d{2})[.\-/년\s]+(\d{1,2})/);
            if (!match) return null;
            return `${match[1]}년 ${String(parseInt(match[2], 10))}월`;
        }

        function renderReadingTimeline() {
            const container = document.getElementById('reading-timeline');
            if (!container) return;
            const groups = {};
            state.recentBooks.forEach(book => {
                const key = parseBookDateToMonth(book.date);
                if (!key) return;
                if (!groups[key]) groups[key] = [];
                groups[key].push(book);
            });
            const keys = Object.keys(groups);
            if (keys.length === 0) {
                container.innerHTML = `<div class="text-xs text-gray-400 text-center py-4">완독일이 있는 책을 추가하면 타임라인이 생성됩니다.</div>`;
                return;
            }
            container.innerHTML = keys.map(month => `
                <div class="relative pl-5 border-l-2 border-brand-sageLight">
                    <div class="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-brand-sage"></div>
                    <h4 class="font-serif font-bold text-brand-navy text-sm mb-2">${month}</h4>
                    <div class="space-y-2">
                        ${groups[month].map(book => `
                            <div class="bg-brand-ivory/50 border border-brand-ivoryDark rounded-xl px-3 py-2 flex items-center justify-between gap-3">
                                <div class="min-w-0">
                                    <span class="block text-xs font-bold text-brand-navy truncate">${book.title}</span>
                                    <span class="block text-[10px] text-gray-500 truncate">${book.author || '미상'} · ${book.date || ''}</span>
                                </div>
                                <span class="text-[9px] bg-white text-brand-sageDark border border-brand-sageLight px-2 py-0.5 rounded-full font-bold shrink-0">완독</span>
                            </div>`).join('')}
                    </div>
                </div>
            `).join('');
        }

        async function loadMyPageRecentBookCover(bookTitle, coverId, coverUrl = null, bookData = {}) {
            const trimmedTitle = (bookTitle || '').trim();
            const coverEl = document.getElementById(coverId);
            try {
                const imageUrl = await getBookCover({ title: trimmedTitle, author: bookData.author || '', isbn: bookData.isbn || '', coverUrl });
                if (imageUrl) {
                    const img = new Image();
                    img.src = imageUrl;
                    img.referrerPolicy = 'no-referrer';
                    img.onload = () => {
                        const target = document.getElementById(coverId);
                        if (target) {
                            target.innerHTML = `<img src="${imageUrl}" class="w-full h-full object-cover" referrerpolicy="no-referrer">`;
                            target.classList.remove('opacity-40', 'mix-blend-overlay');
                            target.classList.add('opacity-100');
                            const titleSpan = target.nextElementSibling;
                            if (titleSpan) titleSpan.classList.add('hidden');
                        }
                    };
                    img.onerror = () => { if (coverEl) generateTypographyCover(trimmedTitle || 'BOOKMATE', coverEl); };
                    return;
                }
            } catch (e) {
                console.info('[BOOKMATE Cover] 최근 완독 표지 로딩 예외:', trimmedTitle, e);
            }
            if (coverEl) generateTypographyCover(trimmedTitle || 'BOOKMATE', coverEl);
        }

        function renderMyPageRecentArchives() {
            const container = document.getElementById('mypage-recent-archives');
            if (!container) return;
            container.innerHTML = '';

            state.recentArchives.forEach(a => {
                const div = document.createElement('div');
                div.className = "p-4 bg-brand-ivory/50 border border-brand-ivoryDark rounded-xl cursor-pointer hover:bg-white hover:border-brand-sage transition-all shadow-sm flex flex-col justify-between";
                div.setAttribute('onclick', "navigate('archive')");
                div.innerHTML = `
                    <div>
                        <span class="inline-block px-2 py-0.5 bg-brand-navy text-white text-[9px] font-bold rounded mb-2">${a.role}</span>
                        <h4 class="font-bold text-sm text-brand-navy truncate">${a.title}</h4>
                        <span class="block text-[10px] text-gray-500 mt-1">${a.date}</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-[10px] text-brand-sage font-bold mt-3 border-t border-brand-ivory pt-2">
                        <i data-lucide="message-square-quote" class="w-3.5 h-3.5"></i> ${a.comments}개의 기록된 사유
                    </div>
                `;
                container.appendChild(div);
            });
            lucide.createIcons();
        }

        function saveProfileSettings() {
            const nickEl = document.getElementById('settings-nickname');
            const nick = nickEl ? nickEl.value.trim() : '';
            if (nick.length === 0) { showToast("대화명을 입력해 주세요.", "error"); return; }
            if (nick.length > 6) { showToast("대화명은 최대 6자까지 가능합니다.", "error"); return; }

            state.currentUser.nickname = nick;
            state.currentUser.library = document.getElementById('settings-library')?.value || state.currentUser.library;
            const selected = document.querySelector('input[name="settings-avatar-type"]:checked')?.value || 'moa-1';
            if (selected.startsWith('moa-')) {
                state.currentUser.avatarType = 'moa';
                state.currentUser.avatarId = Number(selected.replace('moa-', '')) || 1;
                state.currentUser.avatarImage = '';
            } else {
                state.currentUser.avatarType = state.currentUser.avatarImage ? 'upload' : 'moa';
                if (!state.currentUser.avatarImage) state.currentUser.avatarId = 1;
            }
            saveAppState();
            updateUIProfileData();
            renderBookmates();
            closeSettingsModal();
            showToast("프로필 설정이 성공적으로 반영되었습니다!");
        }

        function navigate(viewName) {
            state.currentView = viewName;
            document.querySelectorAll('.view-section').forEach(section => section.classList.add('hidden'));
            const activeView = document.getElementById(`view-${viewName}`);
            if (activeView) activeView.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            lucide.createIcons();
        }

        function openSettingsModal() {
            normalizeAvatarTarget(state.currentUser);
            document.getElementById('settings-nickname').value = state.currentUser.nickname;
            const libraryEl = document.getElementById('settings-library');
            if (libraryEl) libraryEl.value = state.currentUser.library;
            const radioValue = state.currentUser.avatarType === 'upload' && state.currentUser.avatarImage ? 'upload' : `moa-${state.currentUser.avatarId || 1}`;
            const radio = document.querySelector(`input[name="settings-avatar-type"][value="${radioValue}"]`);
            if (radio) radio.checked = true;
            renderSettingsAvatarPreview();
            document.getElementById('settings-modal').classList.remove('hidden');
        }

        function renderSettingsAvatarPreview() {
            const preview = document.getElementById('settings-avatar-preview');
            if (!preview) return;
            const selected = document.querySelector('input[name="settings-avatar-type"]:checked')?.value || 'moa-1';
            let target = { ...state.currentUser };
            if (selected.startsWith('moa-')) {
                target.avatarType = 'moa';
                target.avatarId = Number(selected.replace('moa-', '')) || 1;
                target.avatarImage = '';
            }
            preview.innerHTML = getAvatarHTML(target, 'w-16 h-16', 'border-4 border-white shadow-sm');
        }

        function triggerAvatarFileInput() {
            const fileInput = document.getElementById('settings-avatar-file');
            if (fileInput) fileInput.click();
        }

        function handleAvatarUpload(input) {
            const file = input.files && input.files[0];
            if (!file) return;
            if (!file.type || !file.type.startsWith('image/')) { showToast('이미지 파일만 첨부할 수 있습니다.', 'error'); input.value = ''; return; }
            if (file.size > 10 * 1024 * 1024) { showToast('10MB 이하의 이미지를 첨부해 주세요.', 'error'); input.value = ''; return; }

            const reader = new FileReader();
            reader.onload = () => {
                const finish = (dataUrl) => {
                    state.currentUser.avatarType = 'upload';
                    state.currentUser.avatarImage = dataUrl;
                    const uploadRadio = document.querySelector('input[name="settings-avatar-type"][value="upload"]');
                    if (uploadRadio) uploadRadio.checked = true;
                    const fileName = document.getElementById('settings-avatar-file-name');
                    if (fileName) fileName.innerText = file.name;
                    renderSettingsAvatarPreview();
                    showToast('첨부한 사진이 미리보기에 반영되었습니다. 설정 저장을 눌러 완료해 주세요.');
                };

                const img = new Image();
                img.onload = () => {
                    const maxSize = 512;
                    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.max(1, Math.round(img.width * scale));
                    canvas.height = Math.max(1, Math.round(img.height * scale));
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    finish(canvas.toDataURL('image/jpeg', 0.9));
                };
                img.onerror = () => finish(reader.result);
                img.src = reader.result;
            };
            reader.onerror = () => showToast('사진을 불러오지 못했습니다.', 'error');
            reader.readAsDataURL(file);
        }

        function closeSettingsModal() {
            document.getElementById('settings-modal').classList.add('hidden');
        }

        window.renderSettingsAvatarPreview = renderSettingsAvatarPreview;
        window.handleAvatarUpload = handleAvatarUpload;
        window.triggerAvatarFileInput = triggerAvatarFileInput;
        window.saveProfileSettings = saveProfileSettings;
        window.openSettingsModal = openSettingsModal;
        window.closeSettingsModal = closeSettingsModal;

        function showToast(message, type = "success") {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            const bgColor = type === "error" ? "bg-red-500" : "bg-brand-sageDark";
            toast.className = `${bgColor} text-white px-6 py-3 rounded-xl shadow-lg text-sm font-bold toast-enter flex items-center gap-2`;
            toast.innerHTML = `<i data-lucide="${type === 'error' ? 'alert-circle' : 'check-circle'}" class="w-4 h-4"></i> ${message}`;
            container.appendChild(toast);
            lucide.createIcons();
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
        }

        async function loadBookCover(bookTitle, containerId, extraClass = "w-full h-full object-cover rounded-lg", coverUrl = null, bookData = {}) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const title = (bookTitle || bookData.title || bookData.book || '').trim();
            // spinner가 오래 남지 않도록 기본 표지를 먼저 표시하고, 실제 표지가 확인되면 교체합니다.
            generateTypographyCover(title || 'BOOKMATE', container);

            try {
                const imageUrl = await getBookCover({
                    title,
                    author: bookData.author || '',
                    isbn: bookData.isbn || '',
                    coverUrl: coverUrl || bookData.coverUrl || ''
                });

                if (imageUrl) {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = title || '책 표지';
                    img.className = `${extraClass} shadow-md hover:scale-105 transition-transform duration-300`;
                    img.referrerPolicy = 'no-referrer';
                    img.onerror = () => handleImgError(title || 'BOOKMATE', containerId);
                    container.innerHTML = '';
                    container.appendChild(img);
                    return;
                }
            } catch (e) {
                console.info('[BOOKMATE Cover] 표지 로딩 예외, 기본 표지로 대체:', title, e);
            }
            generateTypographyCover(title || 'BOOKMATE', container);
        }

        function handleImgError(bookTitle, containerId) {
            const container = document.getElementById(containerId);
            if (container) generateTypographyCover(bookTitle, container);
        }

        function generateTypographyCover(bookTitle, container) {
            container.innerHTML = `
                <div class="w-full h-full bg-gradient-to-br from-brand-navy to-brand-navyLight text-white rounded flex flex-col justify-between p-3 text-center shadow-sm relative overflow-hidden">
                    <span class="text-[8px] tracking-wider text-brand-sage uppercase font-semibold">BOOKMATE</span>
                    <span class="font-bold block text-[11px] leading-tight font-serif mt-2 mb-1 line-clamp-3">${bookTitle}</span>
                </div>`;
        }

        function openBookSearchModal(titleTargetId, authorTargetId = null, coverTargetId = null, afterSelect = null) {
            bookSearchContext = { titleTargetId, authorTargetId, coverTargetId, afterSelect };
            const modal = document.getElementById('book-search-modal');
            const input = document.getElementById('book-search-modal-input');
            const titleEl = document.getElementById(titleTargetId);
            if (!modal || !input) return;
            input.value = titleEl ? titleEl.value.trim() : '';
            modal.classList.remove('hidden');
            lucide.createIcons();
            input.focus();
            if (input.value) runBookSearch(input.value);
            else renderBookSearchResults([]);
        }

        function closeBookSearchModal() {
            const modal = document.getElementById('book-search-modal');
            if (modal) modal.classList.add('hidden');
            bookSearchContext = null;
            bookSearchResults = [];
        }

        function handleBookSearchInput(value) {
            clearTimeout(bookSearchTimer);
            bookSearchTimer = setTimeout(() => runBookSearch(value), 350);
        }

        async function runBookSearch(keyword) {
            const resultsEl = document.getElementById('book-search-results');
            const query = (keyword || '').trim();
            if (!resultsEl) return;
            if (!query) {
                renderBookSearchResults([]);
                return;
            }
            resultsEl.innerHTML = `<div class="py-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2"><i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Google Books에서 책 정보를 찾는 중...</div>`;
            lucide.createIcons();
            try {
                bookSearchResults = await searchGoogleBooks(query);
                renderBookSearchResults(bookSearchResults);
            } catch (e) {
                resultsEl.innerHTML = `<div class="py-8 text-center text-xs text-red-500">책 검색 중 오류가 발생했습니다. 직접 입력해 주세요.</div>`;
            }
        }

        function renderBookSearchResults(results) {
            const resultsEl = document.getElementById('book-search-results');
            if (!resultsEl) return;
            if (!results || results.length === 0) {
                resultsEl.innerHTML = `<div class="py-8 text-center text-xs text-gray-400">책 제목을 입력하면 실제 도서 정보를 불러옵니다.</div>`;
                return;
            }
            resultsEl.innerHTML = results.map((book, idx) => `
                <button type="button" onclick="selectBookFromSearch(${idx})" class="w-full text-left p-3 rounded-xl border border-brand-ivoryDark hover:border-brand-sage hover:bg-brand-sageLight/30 transition-all flex gap-3 items-start">
                    <div class="w-12 h-16 bg-brand-navy rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-white text-[9px] font-bold text-center">
                        ${book.thumbnail ? `<img src="${book.thumbnail}" class="w-full h-full object-cover" referrerpolicy="no-referrer">` : `<span class="px-1">BOOKMATE</span>`}
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="font-bold text-sm text-brand-navy line-clamp-1">${book.title}</div>
                        <div class="text-[11px] text-brand-sageDark font-semibold mt-0.5 line-clamp-1">${book.author}</div>
                        <div class="text-[10px] text-gray-400 mt-0.5 line-clamp-1">${[book.publisher, book.publishedDate].filter(Boolean).join(' · ') || (book.source === 'known' ? 'ISBN 기반 표지 우선 제공' : '출판정보 없음')}</div>
                        <div class="text-[10px] text-gray-500 mt-1 line-clamp-2">${book.description ? book.description.replace(/<[^>]+>/g, '') : '책 소개가 제공되지 않았습니다.'}</div>
                    </div>
                    <span class="shrink-0 text-[10px] font-bold text-white bg-brand-navy px-2 py-1 rounded-lg">선택</span>
                </button>
            `).join('');
        }

        function selectBookFromSearch(index) {
            const book = bookSearchResults[index];
            if (!book || !bookSearchContext) return;
            const titleEl = document.getElementById(bookSearchContext.titleTargetId);
            const authorEl = bookSearchContext.authorTargetId ? document.getElementById(bookSearchContext.authorTargetId) : null;
            if (titleEl) {
                titleEl.value = book.title;
                rememberSelectedBook(bookSearchContext.titleTargetId, book);
            }
            if (authorEl) authorEl.value = book.author;
            if (bookSearchContext.coverTargetId) loadBookCover(book.title, bookSearchContext.coverTargetId, "w-16 h-24 object-cover rounded-lg", book.thumbnail);
            saveAppState();
            if (typeof window[bookSearchContext.afterSelect] === 'function') window[bookSearchContext.afterSelect]();
            else if (typeof updateGatheringPreview === 'function') updateGatheringPreview();
            showToast(`『${book.title}』 책 정보를 불러왔습니다.`);
            closeBookSearchModal();
        }

        function handleMainSearch() {
            const searchInput = document.getElementById('main-book-search');
            const q = searchInput ? searchInput.value.trim() : '';
            if (q.length === 0) { showToast("검색어를 입력해 주세요.", "error"); return; }
            quickSearch(q);
        }

        function quickSearch(bookName) {
            state.searchedQuery = bookName;
            const subSearch = document.getElementById('sub-search-input');
            if (subSearch) subSearch.value = bookName;
            safeSetText('search-title', `『${bookName}』 독서모임 검색 결과`);
            safeSetText('search-desc', `선택하신 주제 키워드 혹은 책과 연계 사유도가 높고 유사 시너지를 낼 수 있는 맞춤 소모임 정보입니다.`);
            navigate('search-results');
            triggerLiveSearch(bookName);
        }

        function triggerLiveSearch(val) {
            const filtered = state.gatherings.filter(g => 
                g.title.toLowerCase().includes(val.toLowerCase()) || 
                g.book.toLowerCase().includes(val.toLowerCase()) ||
                g.desc.toLowerCase().includes(val.toLowerCase()) ||
                g.keywords.some(k => k.toLowerCase().includes(val.toLowerCase()))
            );
            renderGatheringsGrid(filtered);
        }

        function renderGatheringsGrid(listData = state.gatherings) {
            const container = document.getElementById('gatherings-grid-container');
            if (!container) return;
            container.innerHTML = '';
            if (listData.length === 0) {
                container.innerHTML = `<div class="col-span-full py-16 text-center text-gray-500 bg-white rounded border border-brand-ivoryDark">검색 결과가 없습니다.</div>`;
                return;
            }
            listData.forEach(g => {
                const isJoined = g.joined;
                const coverId = `grid-cover-${g.id}`;
                let tagBadges = g.keywords.map(keyword => `<span class="bg-brand-sageLight text-brand-sageDark px-2 py-0.5 rounded-full text-[9px] font-bold">#${keyword}</span>`).join(' ');
                
                let scopeBadgeStyle = g.scope === "도서관 전용" ? "bg-amber-100 text-amber-800" : "bg-brand-sageLight text-brand-sageDark";
                let libraryText = g.library ? `(${g.library})` : "";

                const card = document.createElement('div');
                card.className = "bg-white p-6 rounded-2xl border border-brand-ivoryDark hover:border-brand-sage hover:shadow-lg transition-all relative flex flex-col justify-between space-y-4";
                card.innerHTML = `
                    <div class="space-y-3">
                        <div class="flex justify-between items-start flex-wrap gap-1">
                            <span class="${scopeBadgeStyle} px-2.5 py-0.5 rounded-full text-[10px] font-bold">${g.scope} ${libraryText} · ${g.type}</span>
                        </div>
                        <h3 class="serif-title font-bold text-base text-brand-navy mt-1">${g.title}</h3>
                        <div class="flex items-center gap-1.5 text-xs font-semibold text-brand-sageDark bg-brand-sageLight/50 px-2.5 py-1.5 rounded-lg w-fit">
                            <i data-lucide="clock" class="w-3.5 h-3.5"></i> ${g.schedule || '일정 미정'}
                        </div>
                        <p class="text-xs text-gray-500 line-clamp-3">${g.desc}</p>
                        <div class="flex flex-wrap gap-1 mt-1">${tagBadges}<span class="bg-brand-ivory text-brand-navy px-2 py-0.5 rounded-full text-[9px] font-bold border border-brand-ivoryDark">AI 질문 준비</span></div>
                        <div class="space-y-1">
                            <div class="flex justify-between text-[9px] text-gray-400 font-bold"><span>모집률</span><span>${Math.min(100, Math.round((g.membersCount / g.maxMembers) * 100))}%</span></div>
                            <div class="h-1.5 bg-brand-ivoryDark rounded-full overflow-hidden"><div class="h-full bg-brand-sage rounded-full" style="width:${Math.min(100, Math.round((g.membersCount / g.maxMembers) * 100))}%"></div></div>
                        </div>
                        <div class="bg-brand-ivory/50 p-2.5 rounded-xl border border-brand-ivoryDark flex items-center gap-3">
                            <div class="w-10 h-14 bg-brand-navy rounded overflow-hidden shadow-sm shrink-0 flex items-center justify-center text-white" id="${coverId}">${g.book}</div>
                            <div class="text-[10px] leading-tight flex-grow overflow-hidden">
                                <span class="font-bold block text-brand-navy text-sm mb-1 truncate">${g.book}</span>
                                <span class="text-gray-400 text-xs font-medium truncate block">${g.author}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between border-t border-brand-ivory pt-3">
                        <span class="text-[10px] text-gray-400 flex items-center gap-1"><i data-lucide="users" class="w-3.5 h-3.5 text-brand-sage"></i> ${g.membersCount}/${g.maxMembers}명 참여 중</span>
                        <div class="flex gap-2">
                            ${isJoined ? `<button onclick="enterMeetingRoom('${g.book}')" class="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg">입장</button>` : ''}
                            <button onclick="toggleGatheringMembership(${g.id})" class="px-3 py-1.5 rounded-lg text-xs font-bold ${isJoined ? 'bg-brand-ivory text-gray-500' : 'bg-brand-navy text-white'}">${isJoined ? '가입중' : '함께하기'}</button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
                loadBookCover(g.book, coverId, "w-10 h-14 object-cover rounded", g.coverUrl, g);
            });
            lucide.createIcons();
        }

        function toggleGatheringMembership(id) {
            const target = state.gatherings.find(g => g.id === id);
            if (!target) return;
            if (target.joined) {
                target.joined = false;
                target.membersCount--;
                showToast("독서모임 참여를 철회했습니다.");
            } else {
                if (target.library && target.library !== state.currentUser.library) {
                    showToast(`[${target.library}] 회원만 가입할 수 있는 모임입니다.`, "error");
                    return;
                }
                if (target.membersCount >= target.maxMembers) { showToast("모임의 정원이 다 찼습니다.", "error"); return; }
                target.joined = true;
                target.membersCount++;
                showToast(`『${target.title}』 모임에 가입되었습니다!`);
            }
            renderGatheringsGrid();
            renderMyPageGatherings();
            updateUIProfileData();
        }

        function renderMyPageGatherings() {
            const container = document.getElementById('mypage-gatherings-list');
            if (!container) return;
            container.innerHTML = '';
            const joined = state.gatherings.filter(g => g.joined);
            if (joined.length === 0) {
                container.innerHTML = `<div class="col-span-full py-8 text-center text-xs text-gray-400">현재 참여 신청한 독서모임이 없습니다.</div>`;
                return;
            }
            joined.forEach(g => {
                const coverId = `mypage-g-cover-${g.id}`;
                const div = document.createElement('div');
                div.className = "bg-brand-ivory/50 p-5 rounded-xl border border-brand-ivoryDark shadow-sm";
                div.innerHTML = `
                    <div class="flex gap-4 items-start">
                        <div class="w-12 h-16 bg-brand-navy rounded overflow-hidden shadow shrink-0 text-white text-[8px] flex items-center justify-center" id="${coverId}">${g.book}</div>
                        <div class="space-y-1 overflow-hidden">
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <span class="text-[9px] bg-brand-sageLight text-brand-sageDark px-2 py-0.5 rounded-full font-bold">${g.scope} · ${g.method}</span>
                                ${g.isLeader ? `<span class="text-[9px] bg-brand-navy text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 shadow-sm"><i data-lucide="crown" class="w-2.5 h-2.5"></i> 모임장</span>` : ''}
                            </div>
                            <h4 class="font-serif font-bold text-sm text-brand-navy truncate">${g.title}</h4>
                            <p class="text-[10px] text-brand-sageDark font-semibold flex items-center gap-1 mt-0.5"><i data-lucide="clock" class="w-3 h-3"></i> ${g.schedule || '일정 미정'}</p>
                            <p class="text-[10px] text-gray-500 line-clamp-2 mt-1">${g.desc}</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-between text-[10px] border-t border-brand-ivoryDark/50 pt-2.5 mt-3 gap-2">
                        <span class="text-gray-400">대표시작 책: 『${g.book}』</span>
                        <div class="flex gap-2 items-center">
                            ${g.isLeader ? `<button onclick="openEditGatheringModal(${g.id})" class="text-brand-sage font-bold hover:underline mr-1 px-2 py-1 hover:bg-brand-sageLight rounded transition-colors">모임 관리</button>` : ''}
                            <button onclick="enterMeetingRoom('${g.book}')" class="bg-red-600 text-white px-2.5 py-1 rounded font-bold hover:bg-red-700 transition-colors">방 입장</button>
                            ${!g.isLeader ? `<button onclick="toggleGatheringMembership(${g.id})" class="text-red-600 font-bold hover:underline ml-1">탈퇴</button>` : ''}
                        </div>
                    </div>
                `;
                container.appendChild(div);
                loadBookCover(g.book, coverId, "w-12 h-16 object-cover rounded", g.coverUrl, g);
            });
            lucide.createIcons();
        }

        function toggleKeywordSelection(keyword) {
            const index = state.createGatheringState.keywords.indexOf(keyword);
            const map = { '자기계발': 'key-tag-자기계발', '인문학': 'key-tag-인문학', '소설/문학': 'key-tag-소설', '사회/과학': 'key-tag-과학', '힐링/에세이': 'key-tag-힐링' };
            const btnEl = document.getElementById(map[keyword]);
            if (index > -1) {
                state.createGatheringState.keywords.splice(index, 1);
                if (btnEl) btnEl.className = "px-3.5 py-2 bg-brand-ivory border border-brand-ivoryDark rounded-xl text-xs font-semibold text-brand-navy";
            } else {
                state.createGatheringState.keywords.push(keyword);
                if (btnEl) btnEl.className = "px-3.5 py-2 bg-brand-navy border border-brand-navy rounded-xl text-xs font-bold text-white";
            }
            updateGatheringPreview();
        }

        function updateGatheringPreview() {
            const name = document.getElementById('create-g-name')?.value.trim() || '새로운 모임 이름';
            const book = document.getElementById('create-g-book')?.value.trim() || '지정 대기 중';
            safeSetText('preview-title', name);
            safeSetText('preview-book', book);
            
            const keywordBadge = document.getElementById('preview-keywords-badge');
            if(keywordBadge) keywordBadge.innerText = state.createGatheringState.keywords.length > 0 ? state.createGatheringState.keywords.map(k=>`#${k}`).join(', ') : '선택 없음';
            
            const freq = document.getElementById('create-g-freq')?.value || '협의';
            const time = document.getElementById('create-g-time')?.value.trim() || '';
            safeSetText('preview-schedule', time ? `${freq} ${time}` : freq);

            const coverContainer = document.getElementById('preview-cover-container');
            if (coverContainer) {
                if (book.length > 1 && book !== '지정 대기 중') loadBookCover(book, "preview-cover-container", "w-16 h-24 object-cover rounded-lg", getSelectedBookMeta("create-g-book").coverUrl);
                else coverContainer.innerHTML = `<i data-lucide="book" class="w-8 h-8 text-brand-sageDark"></i>`;
                lucide.createIcons();
            }
        }

        function setGatheringToggle(category, value) {
            state.createGatheringState[category] = value;
            safeSetText('preview-tag', `${state.createGatheringState.scope} · ${state.createGatheringState.type}`);
            safeSetText('preview-method', state.createGatheringState.method);
        }

        function updateGatheringMembers(val) {
            safeSetText('g-member-val', val);
            safeSetText('preview-members', `${val}명`);
        }

        function generateAIDescription() {
            const book = document.getElementById('create-g-book')?.value.trim() || '흥미로운 책';
            showToast("AI가 소개글 초안을 작성 중입니다...");
            setTimeout(() => {
                document.getElementById('create-g-desc').value = `『${book}』을 읽고 다양한 감상을 나누는 모임입니다. 편안하고 자유로운 분위기 속에서 건강한 토론을 지향합니다!`;
                updateGatheringPreview();
            }, 800);
        }

        function submitNewGathering() {
            const title = document.getElementById('create-g-name').value.trim();
            const book = document.getElementById('create-g-book').value.trim();
            const bookMeta = getSelectedBookMeta('create-g-book');
            if (!title || !book) { showToast("모임 이름과 책 제목을 입력해 주세요.", "error"); return; }
            
            const freq = document.getElementById('create-g-freq')?.value || '협의';
            const time = document.getElementById('create-g-time')?.value.trim() || '';
            const scheduleStr = time ? `${freq} ${time}` : freq;

            const newGathering = {
                id: state.gatherings.length + 1,
                title: title,
                book: book,
                author: document.getElementById('create-g-author').value.trim() || bookMeta.author || '미상',
                coverUrl: bookMeta.coverUrl || '',
                publisher: bookMeta.publisher || '',
                publishedDate: bookMeta.publishedDate || '',
                isbn: bookMeta.isbn || '',
                membersCount: 1,
                maxMembers: parseInt(document.getElementById('create-g-members').value),
                scope: state.createGatheringState.scope,
                type: state.createGatheringState.type,
                method: state.createGatheringState.method,
                schedule: scheduleStr,
                suitability: 100,
                desc: document.getElementById('create-g-desc').value.trim(),
                keywords: [...state.createGatheringState.keywords],
                joined: true,
                isLeader: true
            };
            state.gatherings.push(newGathering);
            saveAppState();
            renderGatheringsGrid();
            renderMyPageGatherings();
            showToast("모임이 성공적으로 개설되었습니다!");
            navigate('mypage');
        }

        let currentEditGatheringId = null;

        function openEditGatheringModal(id) {
            const g = state.gatherings.find(x => x.id === id);
            if (!g) return;
            currentEditGatheringId = id;
            
            document.getElementById('edit-g-name').value = g.title;
            document.getElementById('edit-g-schedule').value = g.schedule;
            document.getElementById('edit-g-desc').value = g.desc;
            document.getElementById('edit-g-members').value = g.maxMembers;
            document.getElementById('edit-g-member-val').innerText = g.maxMembers;
            
            document.getElementById('edit-gathering-modal').classList.remove('hidden');
        }

        function closeEditGatheringModal() {
            document.getElementById('edit-gathering-modal').classList.add('hidden');
            currentEditGatheringId = null;
        }

        function updateEditGatheringMembers(val) {
            safeSetText('edit-g-member-val', val);
        }

        function saveGatheringEdit() {
            if (!currentEditGatheringId) return;
            const g = state.gatherings.find(x => x.id === currentEditGatheringId);
            if (g) {
                const title = document.getElementById('edit-g-name').value.trim();
                if(!title) { showToast("모임 이름을 입력해 주세요.", "error"); return; }
                
                g.title = title;
                g.schedule = document.getElementById('edit-g-schedule').value.trim();
                g.desc = document.getElementById('edit-g-desc').value.trim();
                g.maxMembers = parseInt(document.getElementById('edit-g-members').value);
                
                showToast("모임 정보가 수정되었습니다.");
                renderGatheringsGrid();
                renderMyPageGatherings();
            }
            closeEditGatheringModal();
        }

        function enterMeetingRoom(bookTitle = "달러구트 꿈 백화점") {
            navigate('club-meeting');
            const titleEl = document.getElementById('meeting-room-title');
            if (titleEl) {
                titleEl.innerText = `${bookTitle} 사색 소모임`;
                if (titleEl.nextElementSibling) titleEl.nextElementSibling.innerText = `지정도서: 『${bookTitle}』`;
            }
            
            state.meetingState.currentAiStage = 1;
            const scroller = document.getElementById('meeting-chat-scroller');
            if (scroller) {
                scroller.innerHTML = `
                    <div class="bg-[#EAF2E8] p-3 rounded-xl border border-brand-sage/20 text-brand-sageDark font-semibold text-center animate-fadeIn" id="meeting-welcome-banner">
                        어서오세요! LIVE 모임방에 입장하셨습니다. 하단의 [모임 시작하기 🚀] 버튼을 눌러보세요.
                    </div>
                    <div class="bg-brand-ivory border border-brand-ivoryDark p-4 rounded-xl space-y-2 flex gap-3 items-start hidden" id="facilitator-prompt-box">
                        <div class="w-12 h-16 rounded overflow-hidden shadow-sm shrink-0 bg-brand-navy text-[8px] text-white flex items-center justify-center" id="meeting-ai-quest-cover-mini">달러구트</div>
                        <div class="space-y-1">
                            <span class="text-[10px] font-bold text-brand-sageDark block flex items-center gap-1"><i data-lucide="bot" class="w-3.5 h-3.5"></i> AI 퍼실리테이터 전담 리드</span>
                            <p class="font-serif font-bold text-brand-navy text-xs leading-relaxed" id="meeting-ai-question">Q1. 첫 번째 질문입니다...</p>
                        </div>
                    </div>
                    <div class="flex justify-center gap-2" id="meeting-action-triggers">
                        <button onclick="triggerFacilitatorIntro()" class="bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md">모임 시작하기 🚀</button>
                    </div>
                `;
            }
            safeSetText('meeting-ai-stage-label', '대기 중...');
            showToast("실시간 토론방에 입장했습니다.");
            lucide.createIcons();
            loadBookCover(bookTitle, "meeting-ai-quest-cover-mini", "w-12 h-16 object-cover rounded shadow-sm");
        }

        function triggerFacilitatorIntro() {
            state.meetingState.currentAiStage = 1;
            renderFacilitatorDialogue();
        }

        function renderFacilitatorDialogue() {
            const scroller = document.getElementById('meeting-chat-scroller');
            if (!scroller) return;
            const welcome = document.getElementById('meeting-welcome-banner');
            if(welcome) welcome.classList.add('hidden');
            
            const data = meetingDialogueScript[state.meetingState.currentAiStage];
            if (!data) return;

            const promptBox = document.getElementById('facilitator-prompt-box');
            if (promptBox) {
                promptBox.classList.remove('hidden');
                safeSetText('meeting-ai-question', data.message);
            }
            safeSetText('meeting-ai-stage-label', data.stageLabel);
            
            const actions = document.getElementById('meeting-action-triggers');
            if (actions) actions.innerHTML = data.actions;

            const bubble = document.createElement('div');
            bubble.className = "flex gap-3 max-w-[85%] animate-fadeIn mt-4 border-l-4 border-brand-sage pl-3 bg-brand-sageLight/30 p-2.5 rounded-r-xl";
            bubble.innerHTML = `
                ${getAIAvatarHTML('w-7 h-7')}
                <div class="space-y-1"><p class="text-xs text-brand-navy whitespace-pre-line">${data.message}</p></div>
            `;
            scroller.appendChild(bubble);
            scroller.scrollTop = scroller.scrollHeight;

            const currentStage = state.meetingState.currentAiStage;
            const peerAnswers = {
                2: [
                    { author: "사유올빼미", text: "저는 하늘을 훨훨 나는 꿈을 꾸면서 스트레스를 날려버리고 싶네요!", delay: 2500 },
                    { author: "지혜의등대", text: "요즘 너무 피곤해서... 아무도 없는 고요한 숲속에서 푹 쉬는 꿈을 사고 싶습니다 🌿", delay: 5000 }
                ],
                4: [
                    { author: "한줄수집가", text: "저는 예전에 기르던 반려견을 다시 만나는 꿈을 비싸게 주고라도 사고 싶어요. ㅠㅠ", delay: 3000 },
                    { author: "지혜의등대", text: "일상의 소소한 기쁨을 다시금 깨닫게 해주는 평범하고 따뜻한 하루의 꿈도 좋겠네요.", delay: 6000 }
                ],
                5: [
                    { author: "사유올빼미", text: "트라우마를 극복하려면 결국 한 번은 정면으로 마주해야 하니까, 악몽도 충분히 가치가 있다고 봅니다.", delay: 3500 },
                    { author: "한줄수집가", text: "저는 조금 무섭긴 하지만... 그래도 극복의 계기가 된다면 용기를 내볼 것 같아요.", delay: 6500 }
                ],
                6: [
                    { author: "지혜의등대", text: "저는 다가올 미래에 대한 설렘과 목표가 절 움직이게 하는 것 같아요. 새로운 기대감이 중요하죠.", delay: 3000 },
                    { author: "사유올빼미", text: "저는 반대로 제가 지나온 과거의 발자취를 보며 '잘 해왔다'는 위안에서 힘을 많이 얻습니다.", delay: 6000 }
                ]
            };

            if (peerAnswers[currentStage]) {
                peerAnswers[currentStage].forEach(peer => {
                    setTimeout(() => {
                        const sc = document.getElementById('meeting-chat-scroller');
                        if(!sc) return;
                        const peerBubble = document.createElement('div');
                        peerBubble.className = "space-y-1 text-xs text-left mt-3 animate-fadeIn";
                        peerBubble.innerHTML = `
                            <span class="font-bold text-brand-navy block">${peer.author} <span class="text-[9px] text-gray-400 font-normal">방금</span></span>
                            <p class="text-gray-700 bg-brand-ivory inline-block px-3 py-2 rounded-xl border border-brand-ivoryDark text-left">${peer.text}</p>
                        `;
                        sc.appendChild(peerBubble);
                        sc.scrollTop = sc.scrollHeight;
                    }, peer.delay);
                });
            }
        }

        function proceedToNextStage() {
            state.meetingState.currentAiStage++;
            if (state.meetingState.currentAiStage > 7) state.meetingState.currentAiStage = 1;
            renderFacilitatorDialogue();
            updateLiveMicStatusList();
        }

        function updateLiveMicStatusList() {
            const stage = state.meetingState.currentAiStage;
            const owl = document.getElementById('mic-status-사유올빼미');
            const lh = document.getElementById('mic-status-지혜의등대');
            if(owl && lh) {
                if(stage === 4 || stage === 5 || stage === 6) owl.innerHTML = `<span class="bg-red-50 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded animate-pulse">대답 중</span>`;
                else owl.innerHTML = `<span class="text-gray-400 text-[9px]">경청 중</span>`;
            }
        }

        function sendMeetingChatMessage() {
            const input = document.getElementById('meeting-chat-input');
            const scroller = document.getElementById('meeting-chat-scroller');
            const txt = input.value.trim();
            if(!txt || !scroller) return;
            const div = document.createElement('div');
            div.className = "space-y-1 text-xs text-right mt-3 animate-fadeIn";
            div.innerHTML = `<span class="font-bold text-brand-navy block">${state.currentUser.nickname} (나)</span>
                             <p class="text-white bg-brand-navy inline-block px-3 py-2 rounded-xl text-left">${txt}</p>`;
            scroller.appendChild(div);
            scroller.scrollTop = scroller.scrollHeight;
            input.value = '';

            setTimeout(() => {
                const peerBubble = document.createElement('div');
                peerBubble.className = "space-y-1 text-xs text-left mt-2 animate-fadeIn";
                const peers = ["한줄수집가", "지혜의등대", "사유올빼미"];
                const peerName = peers[Math.floor(Math.random() * peers.length)];
                
                const reactions = [
                    `${state.currentUser.nickname}님의 생각에 깊이 공감합니다! 좋은 시각이네요.`,
                    "오, 그렇게 생각할 수도 있겠군요. 흥미로운 관점입니다.",
                    "저도 책 읽으면서 정확히 그 부분에서 멈칫했어요. 맞습니다.",
                    "말씀해주신 부분 덕분에 제 생각도 더 또렷하게 정리가 되네요. 감사합니다!",
                    "완전 동의합니다. 고개가 저절로 끄덕여지네요.",
                    "그 의견 들으니까 책을 다시 한 번 읽어보고 싶어지네요."
                ];
                const reaction = reactions[Math.floor(Math.random() * reactions.length)];
                
                peerBubble.innerHTML = `
                    <span class="font-bold text-brand-navy block">${peerName} <span class="text-[9px] text-gray-400 font-normal">방금</span></span>
                    <p class="text-gray-700 bg-brand-ivory inline-block px-3 py-2 rounded-xl border border-brand-ivoryDark text-left">${reaction}</p>
                `;
                scroller.appendChild(peerBubble);
                scroller.scrollTop = scroller.scrollHeight;
            }, 1500 + Math.random() * 1000);
        }

        function meetingUserAct(actionKey) {
            const scroller = document.getElementById('meeting-chat-scroller');
            if(!scroller) return;

            let userSpeech = '';
            let peerResponses = [];

            if (actionKey === 'greet') {
                userSpeech = `안녕하세요! 반갑습니다. ${state.currentUser.nickname}입니다. 오늘 따뜻한 대화 나누었으면 좋겠네요. 😊`;
                peerResponses = [
                    { author: "사유올빼미", text: "환영합니다! 저번 모임에서 남기신 서평 요약 잘 읽었습니다." },
                    { author: "지혜의등대", text: "반갑습니다! 오늘은 소설이라 마음 가볍게 참여했네요." }
                ];
            } else if (actionKey === 'ice1' || actionKey === 'ice2') {
                userSpeech = actionKey === 'ice1' ? "하늘을 자유롭게 날아다니는 상쾌한 꿈을 다시 꾸고 싶어요." : "만개한 귤나무 아래서 은은한 과수원 향기를 느끼는 꿈이 인상 깊었어요.";
                peerResponses = [
                    { author: "한줄수집가", text: `${state.currentUser.nickname}님의 상상만으로도 온몸이 이완되는 포근한 기분입니다.` }
                ];
            } else if (actionKey === 'p1_opt1' || actionKey === 'p1_opt2') {
                userSpeech = actionKey === 'p1_opt1' ? "그리운 사람과 꿈속에서마저 정다운 안부를 묻는 가치를 사고 싶습니다." : "스트레스 없이 가볍게 잠들어 온전히 내 마음의 피로를 비우는 꿈을 희망해요.";
                peerResponses = [
                    { author: "사유올빼미", text: "저도요. 꿈 백화점에서 파는 무형의 감정이 현실을 지탱하는 든든한 위로가 되어 주니까요." }
                ];
            } else if (actionKey === 'p2_opt1' || actionKey === 'p2_opt2') {
                userSpeech = actionKey === 'p2_opt1' ? "두려운 대상을 회피하기보다는 꿈속에서나마 직면할 기회를 얻는 것이 극복의 첫걸음이라고 생각해요." : "현실의 고통만으로도 벅차기에 무의식 속에서는 순수히 해방될 수 있는 위로만을 바라는 마음입니다.";
                peerResponses = [
                    { author: "지혜의등대", text: `${state.currentUser.nickname}님의 의견에 동의합니다. 결국 내가 한 단계 성장했다는 증명이자 백신 역할을 해주는 셈이죠.` }
                ];
            } else if (actionKey === 'p3_opt1' || actionKey === 'p3_opt2') {
                userSpeech = actionKey === 'p3_opt1' ? "내가 성실히 극복하고 쌓아온 과거의 위로와 수용에서 깊은 전진 에너지를 얻습니다." : "앞으로 가야 할 미지의 가능성과 새로운 설렘이 저를 앞으로 움직이게 합니다.";
                peerResponses = [
                    { author: "사유올빼미", text: "맞아요, 그 두 가지 에너지가 교차하며 비로소 중심을 잡아나가는 것 같습니다." }
                ];
            }

            const div = document.createElement('div');
            div.className = "space-y-1 text-xs text-right mt-3 animate-fadeIn";
            div.innerHTML = `<span class="font-bold text-brand-navy block">${state.currentUser.nickname} (나) <span class="text-[9px] text-gray-400 font-normal">방금</span></span>
                             <p class="text-white bg-brand-navy inline-block px-3 py-2 rounded-xl text-left">${userSpeech}</p>`;
            scroller.appendChild(div);
            scroller.scrollTop = scroller.scrollHeight;

            peerResponses.forEach((peer, idx) => {
                setTimeout(() => {
                    const peerBubble = document.createElement('div');
                    peerBubble.className = "space-y-1 text-xs text-left mt-2 animate-fadeIn";
                    peerBubble.innerHTML = `
                        <span class="font-bold text-brand-navy block">${peer.author} <span class="text-[9px] text-gray-400 font-normal">방금</span></span>
                        <p class="text-gray-700 bg-brand-ivory inline-block px-3 py-2 rounded-xl border border-brand-ivoryDark text-left">${peer.text}</p>
                    `;
                    scroller.appendChild(peerBubble);
                    scroller.scrollTop = scroller.scrollHeight;
                }, 1200 + (idx * 1500));
            });
        }

        function triggerVoiceSpeechSimulation() {
            showToast("마이크 입력을 듣고 있습니다...", "success");
            setTimeout(() => {
                const input = document.getElementById('meeting-chat-input');
                if(input) { input.value = "저도 깊은 공감을 느꼈습니다."; showToast("음성이 텍스트로 변환되었습니다."); }
            }, 1500);
        }

        function toggleMyMic() {
            state.meetingState.myMicOn = !state.meetingState.myMicOn;
            const badge = document.getElementById('my-mic-status-badge');
            if (badge) {
                if(state.meetingState.myMicOn) { badge.className="bg-brand-sageLight text-brand-sageDark text-[9px] px-2.5 py-1 rounded-md font-bold"; badge.innerText="마이크 켜짐"; }
                else { badge.className="bg-red-100 text-red-600 text-[9px] px-2.5 py-1 rounded-md font-bold"; badge.innerText="음소거"; }
            }
        }

        function toggleMyCam() {
            state.meetingState.myCamOn = !state.meetingState.myCamOn;
            showToast(state.meetingState.myCamOn ? "카메라가 켜졌습니다." : "카메라가 꺼졌습니다.");
        }

        function exitClubMeeting() {
            navigate('home');
            showToast("토론방에서 퇴장하였습니다.");
        }

        function archiveAndEndMeeting() {
            showToast("회의 요약본이 안전하게 아카이브에 저장되었습니다.");
            navigate('archive');
        }

        function triggerGatheringKeepVote() {
            showToast("회원들에게 '유지 여부 투표'를 발송했습니다.");
        }

        function triggerMeetingAiAssist(cmd) {
            showToast(cmd === 'summary' ? "AI가 핵심 사유를 요약 중입니다." : "AI가 반대 관점을 제안합니다.");
        }

        function handleMeetingChatKeyPress(e) {
            if (e.key === 'Enter') sendMeetingChatMessage();
        }

        // --- AI 1:1 토론방 (Gemini API 연동 로직) --- //

        function handleAIChatKeyPress(e) {
            if (e.key === 'Enter') sendAIChatMessage();
        }

        function openNewAIChatModal() {
            document.getElementById('new-ai-chat-book-title').value = '';
            document.getElementById('new-ai-chat-modal').classList.remove('hidden');
        }

        function closeNewAIChatModal() {
            document.getElementById('new-ai-chat-modal').classList.add('hidden');
        }

        function startNewAIChat() {
            const title = document.getElementById('new-ai-chat-book-title').value.trim();
            if(!title) { showToast("책 제목을 입력해주세요.", "error"); return; }
            closeNewAIChatModal();
            resetAIChat(title);
            showToast(`『${title}』에 대한 AI 토론을 시작합니다.`);
        }

        function getMockBookAnalysis(bookTitle) {
            const title = normalizeTitle(bookTitle || '선택한 책');
            const known = findKnownBook(title);
            const category = known?.category || (title.match(/사피엔스|유전자|코스모스|집중력/) ? '인문·사회' : '문학·교양');
            return {
                intro: category.includes('소설') || category.includes('문학') ? `『${title}』은 인물과 사건의 결을 따라가며 나의 삶과 타인의 마음을 함께 비춰보게 하는 책입니다.` : `『${title}』은 익숙한 세계를 다른 관점으로 바라보게 하며, 독자의 질문을 넓혀 주는 책입니다.`,
                keywords: category.includes('자기') ? ['습관', '실천', '성장', '자기관리'] : category.includes('과학') || category.includes('사회') || category.includes('인문') ? ['사회', '변화', '관점', '질문'] : ['감정', '관계', '성장', '공감'],
                target: category.includes('자기') ? '꾸준한 실천과 자기 성장을 원하는 독자' : category.includes('과학') || category.includes('사회') || category.includes('인문') ? '사회 변화와 인간 이해에 관심 있는 독자' : '인물의 감정선과 삶의 의미를 함께 나누고 싶은 독자',
                time: category.includes('고전') ? '약 4~6시간' : category.includes('사회') || category.includes('과학') || title === '사피엔스' ? '약 8~10시간' : '약 3~5시간',
                difficulty: category.includes('사회') || category.includes('과학') || title === '사피엔스' ? '★★★★☆' : '★★★☆☆'
            };
        }

        function renderAIBookAnalysisCard(bookTitle = state.currentAIBook) {
            const el = document.getElementById('ai-book-analysis-card');
            if (!el) return;
            const data = getMockBookAnalysis(bookTitle);
            el.innerHTML = `
                <div class="p-3 bg-brand-ivory/60 rounded-xl border border-brand-ivoryDark leading-relaxed text-brand-navy">${data.intro}</div>
                <div class="grid grid-cols-2 gap-2">
                    <div class="p-2 bg-brand-sageLight/40 rounded-lg"><span class="block text-[9px] text-gray-500 font-bold">예상 독서시간</span><b class="text-brand-navy">${data.time}</b></div>
                    <div class="p-2 bg-brand-sageLight/40 rounded-lg"><span class="block text-[9px] text-gray-500 font-bold">난이도</span><b class="text-brand-navy">${data.difficulty}</b></div>
                </div>
                <div><span class="block text-[10px] font-bold text-gray-400 mb-1">핵심 키워드</span><div class="flex flex-wrap gap-1">${data.keywords.map(k=>`<span class="bg-brand-sageLight text-brand-sageDark px-2 py-0.5 rounded-full text-[9px] font-bold">#${k}</span>`).join('')}</div></div>
                <div class="text-[11px] text-gray-600"><b class="text-brand-navy">추천 대상</b><br>${data.target}</div>
                <div class="pt-2 border-t border-brand-ivoryDark space-y-1">
                    <b class="text-brand-navy text-[11px]">AI 토론 질문</b>
                    <ol class="list-decimal list-inside space-y-1 text-[11px] text-gray-600">
                        <li>이 책의 핵심 메시지는 무엇이라고 생각하나요?</li>
                        <li>가장 오래 남은 장면이나 문장은 무엇인가요?</li>
                        <li>이 관점을 오늘의 사회나 나의 일상에 적용하면 어떤 의미가 있을까요?</li>
                        <li>저자의 주장이나 인물의 선택에 동의하나요?</li>
                        <li>이 책을 읽고 함께 실천해볼 수 있는 작은 변화는 무엇일까요?</li>
                    </ol>
                </div>`;
        }

        function resetAIChat(bookTitle = state.currentAIBook) {
            state.currentAIBook = bookTitle;
            state.aiChatTurns = 0;
            
            safeSetText('ai-note-status', '대화 분석 대기');
            const impEl = document.getElementById('note-impressive');
            if(impEl) impEl.innerHTML = '<span class="text-gray-400 text-[10px] font-normal not-italic">(대화를 나누면 AI가 핵심 문장을 스크랩합니다)</span>';
            const kwEl = document.getElementById('note-keywords');
            if(kwEl) kwEl.innerHTML = '<span class="text-gray-400 text-[10px] p-1 inline-block border border-dashed border-gray-200 rounded-md w-full text-center">키워드 추출 대기 중...</span>';
            const perEl = document.getElementById('note-perspective');
            if(perEl) perEl.innerHTML = '<span class="text-brand-sage/50 text-[10px] font-normal absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">(확장된 시각이 이곳에 정리됩니다)</span>';

            const headerBookEl = document.getElementById('ai-chat-header-book');
            if (headerBookEl) headerBookEl.innerText = `『${bookTitle}』을(를) 함께 깊이 읽는 중`;
            renderAIBookAnalysisCard(bookTitle);

            const scroller = document.getElementById('ai-chat-scroller');
            const welcomeMsg = `안녕하세요 ${state.currentUser.nickname}님. 오늘은 어떤 이야기를 나누어 볼까요? 『${bookTitle}』에서 가장 인상 깊었던 장면이나 책장을 덮은 후 남은 사유가 있다면 편하게 들려주세요.`;

            state.aiChatHistory = [
                { role: "user", parts: [{ text: `안녕하세요, 독서 퍼실리테이터님! 오늘 ${bookTitle}에 대해 이야기하고 싶어요.` }] },
                { role: "model", parts: [{ text: welcomeMsg }] }
            ];

            if (scroller) {
                scroller.innerHTML = `
                    <div class="flex gap-3 max-w-[85%] animate-fadeIn">
                        ${getAIAvatarHTML('w-7 h-7', 'flex-shrink-0')}
                        <div class="bg-brand-ivory rounded-2xl p-4 text-xs leading-relaxed text-brand-navy border border-brand-ivoryDark">
                            ${welcomeMsg}
                        </div>
                    </div>
                `;
            }
        }

        async function analyzeUserThoughtsWithAI(userText) {
            const status = document.getElementById('ai-note-status');
            if (status) {
                status.innerText = "사유 분석 중...";
                status.classList.add('animate-pulse');
            }

            try {
                if (!apiKey) throw new Error("No API Key");

                const systemPrompt = `사용자의 독서 감상 텍스트를 분석하여 다음 JSON 형식으로만 응답해. 마크다운 없이 순수 JSON 문자열만 반환해야 해.
{
  "impressive": "사용자 입력 내용 중 가장 핵심이 되는 문장 1개 발췌",
  "keywords": ["텍스트에서 추출한 핵심 사유 키워드 2개"],
  "perspective": "이 사용자의 관점에서 한 단계 더 철학적으로 확장된 새로운 질문이나 관점 1문장"
}`;
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
                const payload = {
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: "user", parts: [{ text: userText }] }]
                };

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error("API Error");
                const data = await response.json();
                let jsonText = data.candidates[0].content.parts[0].text;
                jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
                const result = JSON.parse(jsonText);

                if (result.impressive) {
                    document.getElementById('note-impressive').innerHTML = `"${result.impressive}"`;
                }
                
                if (result.keywords && Array.isArray(result.keywords)) {
                    const kwContainer = document.getElementById('note-keywords');
                    let kwHtml = kwContainer.innerHTML.includes('대기 중') ? '' : kwContainer.innerHTML;
                    result.keywords.forEach((kw, i) => {
                        kwHtml += `<span class="bg-brand-sageLight text-brand-sageDark px-2 py-1 rounded-md text-[10px] font-bold border border-brand-sage/20 shadow-sm animate-fadeIn" style="animation-delay: ${i*0.1}s">#${kw}</span> `;
                    });
                    kwContainer.innerHTML = kwHtml;
                }
                
                if (result.perspective) {
                    document.getElementById('note-perspective').innerHTML = `<span class="animate-fadeIn block text-brand-navy leading-relaxed">${result.perspective}</span>`;
                }

                if (status) {
                    status.innerText = "분석 완료";
                    status.classList.remove('animate-pulse');
                }

            } catch (e) {
                console.log("AI 분석 실패, 로컬 키워드 추출로 대체합니다.", e);
                const words = userText.split(' ').filter(w => w.length > 1);
                const keywords = words.slice(0, 2).map(w => w.replace(/[^가-힣a-zA-Z0-9]/g, ''));
                const excerpt = userText.length > 40 ? userText.substring(0, 40) + "..." : userText;
                
                document.getElementById('note-impressive').innerHTML = `"${excerpt}"`;
                
                if (keywords.length > 0) {
                    const kwContainer = document.getElementById('note-keywords');
                    let kwHtml = kwContainer.innerHTML.includes('대기 중') ? '' : kwContainer.innerHTML;
                    keywords.forEach((kw, i) => {
                        if(kw) kwHtml += `<span class="bg-brand-sageLight text-brand-sageDark px-2 py-1 rounded-md text-[10px] font-bold border border-brand-sage/20 shadow-sm animate-fadeIn" style="animation-delay: ${i*0.1}s">#${kw}</span> `;
                    });
                    kwContainer.innerHTML = kwHtml;
                }
                
                document.getElementById('note-perspective').innerHTML = `<span class="animate-fadeIn block text-brand-sage/80 italic">"${keywords[0] || '이 부분'}"에 대해 다른 독자들과 비교해보면 새로운 시각이 열릴 수 있습니다.</span>`;
                
                if (status) {
                    status.innerText = "분석 완료";
                    status.classList.remove('animate-pulse');
                }
            }
        }

        async function fetchGeminiResponse(history) {
            const systemPrompt = `당신은 따뜻하고 공감 능력이 뛰어난 '독서 퍼실리테이터'입니다. 사용자가 읽은 책(현재 '${state.currentAIBook}')에 대해 깊이 있는 사유를 할 수 있도록 부드럽고 다정한 어조로 질문을 던지고 공감해 주세요. 정답을 주지 말고, 사용자의 생각을 이끌어내는 데 집중하세요. 가급적 1~2문장으로 짧게 핵심만 말하세요.`;
            
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
            const payload = {
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: history
            };

            const delays = [1000, 2000, 4000, 8000, 16000];
            for (let i = 0; i <= delays.length; i++) {
                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    
                    const data = await response.json();
                    return data.candidates[0].content.parts[0].text;
                } catch (error) {
                    if (i === delays.length) {
                        showToast("AI 서버와의 연결이 원활하지 않습니다.", "error");
                        return "죄송해요, 지금 제 생각이 조금 엉켜서 정리가 필요해요. 잠시 후 다시 말씀해 주시겠어요?";
                    }
                    await new Promise(resolve => setTimeout(resolve, delays[i]));
                }
            }
        }

        async function sendAIChatMessage() {
            const input = document.getElementById('ai-chat-input');
            const scroller = document.getElementById('ai-chat-scroller');
            const typingIndicator = document.getElementById('ai-typing-indicator');
            const txt = input.value.trim();
            
            if (!txt) return;

            const uDiv = document.createElement('div');
            uDiv.className = "flex gap-3 max-w-[85%] ml-auto justify-end animate-fadeIn";
            uDiv.innerHTML = `<div class="bg-brand-navy text-white rounded-2xl p-4 text-xs leading-relaxed border border-brand-navy/10 shadow-sm">${txt}</div>`;
            scroller.appendChild(uDiv);
            input.value = '';
            scroller.scrollTop = scroller.scrollHeight;

            if (typeof analyzeUserThoughtsWithAI === 'function') {
                analyzeUserThoughtsWithAI(txt);
            }

            state.aiChatHistory.push({ role: "user", parts: [{ text: txt }] });

            typingIndicator.classList.remove('hidden');
            scroller.scrollTop = scroller.scrollHeight;

            const replyText = await fetchGeminiResponse(state.aiChatHistory);

            typingIndicator.classList.add('hidden');

            state.aiChatHistory.push({ role: "model", parts: [{ text: replyText }] });

            const aiDiv = document.createElement('div');
            aiDiv.className = "flex gap-3 max-w-[85%] animate-fadeIn mt-2";
            aiDiv.innerHTML = `
                ${getAIAvatarHTML('w-7 h-7', 'flex-shrink-0')}
                <div class="bg-brand-ivory rounded-2xl p-4 text-xs leading-relaxed text-brand-navy border border-brand-ivoryDark shadow-sm space-y-2">
                    <p>${replyText.replace(/\n/g, '<br>')}</p>
                </div>
            `;
            scroller.appendChild(aiDiv);
            scroller.scrollTop = scroller.scrollHeight;

            if (!state.aiChatTurns) state.aiChatTurns = 0;
            state.aiChatTurns++;
            if (state.aiChatTurns === 2) {
                setTimeout(() => {
                    const cardWrap = document.createElement('div');
                    cardWrap.className = "max-w-[85%] animate-fadeIn mt-4 mb-2 ml-10";
                    cardWrap.innerHTML = `
                        <div class="bg-gradient-to-br from-[#EAF2E8] to-white p-4 rounded-2xl border border-brand-sage/30 shadow-sm relative overflow-hidden group">
                            <div class="absolute -right-4 -top-4 text-brand-sage/5 transition-transform group-hover:scale-110 duration-500 pointer-events-none">
                                <i data-lucide="users" class="w-28 h-28"></i>
                            </div>
                            <div class="relative z-10 space-y-4">
                                <div>
                                    <h4 class="text-[11px] font-bold text-brand-sageDark flex items-center gap-1.5 mb-1"><i data-lucide="link" class="w-3.5 h-3.5"></i> 사유가 맞닿은 독자 추천</h4>
                                    <p class="text-[10px] text-gray-500 leading-snug">방금 정리하신 관점과 유사한 문장을 스크랩한 독자가 있습니다. 인사를 건네볼까요?</p>
                                </div>
                                
                                <div class="bg-white/80 backdrop-blur p-3 rounded-xl border border-brand-sage/20 flex items-center justify-between shadow-sm">
                                    <div class="flex items-center gap-2.5">
                                        <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center font-serif shrink-0">사</div>
                                        <div class="overflow-hidden">
                                            <h5 class="text-xs font-bold text-brand-navy truncate">사유올빼미</h5>
                                            <p class="text-[9px] text-brand-sage font-medium">"고통은 회피할 때보다 마주할 때..."</p>
                                        </div>
                                    </div>
                                    <button onclick="sayHelloToReader('사유올빼미')" class="px-3 py-1.5 bg-brand-navy text-white text-[10px] font-bold rounded-lg hover:bg-brand-navyLight shrink-0 transition-colors">인사하기</button>
                                </div>

                                <div class="pt-3 border-t border-brand-sage/20">
                                    <h4 class="text-[11px] font-bold text-brand-navy mb-2 flex items-center gap-1.5"><i data-lucide="message-square-plus" class="w-3.5 h-3.5 text-brand-sage"></i> 지금 이야기 나누기 좋은 토론방</h4>
                                    <div class="bg-white/80 backdrop-blur p-3 rounded-xl border border-brand-ivoryDark flex items-center justify-between cursor-pointer hover:border-brand-sage shadow-sm transition-colors" onclick="enterMeetingRoom('${state.currentAIBook}')">
                                        <div>
                                            <span class="inline-flex items-center gap-1 bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[8px] font-bold mb-1">
                                                <span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> LIVE
                                            </span>
                                            <h5 class="text-[11px] font-bold text-brand-navy truncate">${state.currentAIBook} 사색 소모임</h5>
                                        </div>
                                        <i data-lucide="chevron-right" class="w-4 h-4 text-brand-sage"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    scroller.appendChild(cardWrap);
                    lucide.createIcons();
                    scroller.scrollTop = scroller.scrollHeight;
                }, 2000);
            }
        }

        function publishSocialPost() {
            const text = document.getElementById('social-post-text').value.trim();
            if(!text) { showToast("내용을 입력해주세요", "error"); return; }
            state.socialPosts.unshift({
                id: Date.now(),
                author: state.currentUser.nickname,
                authorInitial: state.currentUser.nickname.charAt(0),
                time: "방금",
                category: state.activeSocialCategory,
                book: document.getElementById('social-post-book').value.trim(),
                text: text,
                likes: 0,
                liked: false,
                showComments: false,
                comments: []
            });
            renderSocialFeed();
            renderRecommendationRanking();
            document.getElementById('social-post-text').value = '';
            document.getElementById('social-post-book').value = '';
        }

        function setSocialCategory(cat) { state.activeSocialCategory = cat; }
        function filterSocialFeed(cat) { state.socialFilter = cat; renderSocialFeed(); }
        
        function renderSocialFeed() {
            const container = document.getElementById('social-feed-container');
            if (!container) return;
            container.innerHTML = '';
            let list = state.socialFilter === '전체' ? state.socialPosts : state.socialPosts.filter(p=>p.category===state.socialFilter);
            
            if (list.length === 0) {
                container.innerHTML = '<div class="p-8 text-center text-gray-400 text-xs bg-white rounded-xl border border-brand-ivoryDark">게시글이 없습니다. 첫 글의 주인공이 되어보세요!</div>';
                return;
            }

            list.forEach(p => {
                const commentCount = p.comments.length + p.comments.reduce((acc, c) => acc + (c.replies ? c.replies.length : 0), 0);
                
                let commentsHTML = '';
                if (p.showComments) {
                    let cListHTML = p.comments.map(c => {
                        let repliesHTML = (c.replies || []).map(r => `
                            <div class="flex gap-2 mt-3 ml-8">
                                ${getAvatarByName(r.author, 'w-6 h-6')}
                                <div class="flex-grow">
                                    <div class="bg-white p-3 rounded-xl rounded-tl-none border border-brand-ivoryDark shadow-sm">
                                        <div class="flex justify-between items-start mb-1">
                                            <span class="font-bold text-[10px] text-brand-navy">${r.author} <span class="font-normal text-gray-400 ml-1">${r.time}</span></span>
                                        </div>
                                        <p class="text-xs text-brand-navy">${r.text}</p>
                                    </div>
                                    <div class="flex gap-3 mt-1.5 ml-1">
                                        <button onclick="likeSocialItem('reply', ${p.id}, ${c.id}, ${r.id})" class="text-[10px] font-semibold flex items-center gap-1 transition-colors ${r.liked?'text-red-500':'text-gray-400 hover:text-brand-sage'}"><i data-lucide="heart" class="w-3 h-3 ${r.liked?'fill-red-500':''}"></i> ${r.likes}</button>
                                    </div>
                                </div>
                            </div>
                        `).join('');

                        let replyInputHTML = c.showReplyInput ? `
                            <div class="mt-3 ml-8 flex gap-2 items-center animate-fadeIn">
                                ${getAvatarHTML(state.currentUser, 'w-6 h-6')}
                                <input id="reply-input-${c.id}" type="text" placeholder="대댓글을 입력하세요..." class="flex-1 bg-white border border-brand-ivoryDark rounded-lg px-3 py-1.5 text-xs outline-none focus:border-brand-sage" onkeypress="if(event.key === 'Enter') addSocialReply(${p.id}, ${c.id})">
                                <button onclick="addSocialReply(${p.id}, ${c.id})" class="bg-brand-navy text-white px-3 py-1.5 rounded-lg text-[10px] font-bold">등록</button>
                            </div>
                        ` : '';

                        return `
                            <div class="flex gap-2 mt-4">
                                ${getAvatarByName(c.author, 'w-7 h-7')}
                                <div class="flex-grow">
                                    <div class="bg-white p-3 rounded-xl rounded-tl-none border border-brand-ivoryDark shadow-sm">
                                        <div class="flex justify-between items-start mb-1">
                                            <span class="font-bold text-xs text-brand-navy">${c.author} <span class="font-normal text-gray-400 ml-1 text-[10px]">${c.time}</span></span>
                                        </div>
                                        <p class="text-xs text-brand-navy">${c.text}</p>
                                    </div>
                                    <div class="flex gap-3 mt-1.5 ml-1">
                                        <button onclick="likeSocialItem('comment', ${p.id}, ${c.id})" class="text-[10px] font-semibold flex items-center gap-1 transition-colors ${c.liked?'text-red-500':'text-gray-400 hover:text-brand-sage'}"><i data-lucide="heart" class="w-3 h-3 ${c.liked?'fill-red-500':''}"></i> ${c.likes}</button>
                                        <button onclick="toggleReplyInput(${p.id}, ${c.id})" class="text-[10px] text-gray-400 hover:text-brand-navy font-bold">답글 달기</button>
                                    </div>
                                    ${repliesHTML}
                                    ${replyInputHTML}
                                </div>
                            </div>
                        `;
                    }).join('');

                    commentsHTML = `
                        <div class="mt-4 pt-4 border-t border-brand-ivoryDark bg-brand-ivory/30 -mx-6 px-6 pb-2 rounded-b-2xl animate-fadeIn">
                            ${cListHTML}
                            <div class="mt-4 flex gap-2 items-center pb-2">
                                ${getAvatarHTML(state.currentUser, 'w-8 h-8')}
                                <input id="comment-input-${p.id}" type="text" placeholder="이 이야기에 댓글을 남겨보세요..." class="flex-1 bg-white border border-brand-ivoryDark rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-sage" onkeypress="if(event.key === 'Enter') addSocialComment(${p.id})">
                                <button onclick="addSocialComment(${p.id})" class="bg-brand-navy hover:bg-brand-navyLight text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm">등록</button>
                            </div>
                        </div>
                    `;
                }

                let catBadgeColor = "bg-[#FAF1D6] text-amber-800";
                if(p.category === '감상') catBadgeColor = "bg-[#EAF2E8] text-brand-sageDark";
                if(p.category === '질문') catBadgeColor = "bg-blue-50 text-blue-600";

                const div = document.createElement('div');
                div.className = "bg-white p-6 rounded-2xl border border-brand-ivoryDark shadow-sm hover:border-brand-sage/50 transition-colors";
                div.innerHTML = `
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-2.5">
                            ${getAvatarByName(p.author, 'w-9 h-9')}
                            <div>
                                <h4 class="font-bold text-xs text-brand-navy">${p.author} <span class="text-[9px] text-gray-400 font-normal ml-1">${p.time}</span></h4>
                                ${p.book ? `<span class="text-[10px] text-brand-sage font-semibold flex items-center gap-1 mt-0.5"><i data-lucide="book" class="w-3 h-3"></i> ${p.book}</span>` : ''}
                            </div>
                        </div>
                        <span class="${catBadgeColor} text-[10px] px-2.5 py-0.5 rounded-full font-bold">${p.category}</span>
                    </div>
                    <div class="text-xs text-gray-700 leading-relaxed mb-4">${p.text}</div>
                    <div class="flex gap-4 text-xs border-t border-brand-ivory pt-3 mt-2">
                        <button onclick="likeSocialItem('post', ${p.id})" class="flex items-center gap-1.5 font-semibold transition-colors ${p.liked ? 'text-red-500' : 'text-gray-400 hover:text-brand-navy'}">
                            <i data-lucide="heart" class="w-4 h-4 ${p.liked?'fill-red-500':''}"></i> 좋아요 ${p.likes}
                        </button>
                        <button onclick="toggleSocialComments(${p.id})" class="flex items-center gap-1.5 font-semibold text-gray-400 hover:text-brand-navy transition-colors">
                            <i data-lucide="message-circle" class="w-4 h-4"></i> 댓글 ${commentCount}
                        </button>
                    </div>
                    ${commentsHTML}
                `;
                container.appendChild(div);
            });
            lucide.createIcons();
        }

        function likeSocialItem(type, postId, commentId = null, replyId = null) {
            const p = state.socialPosts.find(x => x.id === postId);
            if (!p) return;
            
            if (type === 'post') {
                p.liked = !p.liked;
                p.likes += p.liked ? 1 : -1;
            } else if (type === 'comment') {
                const c = p.comments.find(x => x.id === commentId);
                if (c) {
                    c.liked = !c.liked;
                    c.likes += c.liked ? 1 : -1;
                }
            } else if (type === 'reply') {
                const c = p.comments.find(x => x.id === commentId);
                if (c) {
                    const r = c.replies.find(x => x.id === replyId);
                    if (r) {
                        r.liked = !r.liked;
                        r.likes += r.liked ? 1 : -1;
                    }
                }
            }
            renderSocialFeed();
        }

        function toggleSocialComments(postId) {
            const p = state.socialPosts.find(x => x.id === postId);
            if (p) { p.showComments = !p.showComments; renderSocialFeed(); }
        }

        function toggleReplyInput(postId, commentId) {
            const p = state.socialPosts.find(x => x.id === postId);
            if (!p) return;
            const c = p.comments.find(x => x.id === commentId);
            if (c) { c.showReplyInput = !c.showReplyInput; renderSocialFeed(); }
        }

        function addSocialComment(postId) {
            const input = document.getElementById(`comment-input-${postId}`);
            const text = input ? input.value.trim() : '';
            if(!text) return;

            const p = state.socialPosts.find(x => x.id === postId);
            if (p) {
                p.comments.push({
                    id: Date.now(),
                    author: state.currentUser.nickname,
                    text: text,
                    time: "방금",
                    likes: 0,
                    liked: false,
                    showReplyInput: false,
                    replies: []
                });
                renderSocialFeed();
            }
        }

        function addSocialReply(postId, commentId) {
            const input = document.getElementById(`reply-input-${commentId}`);
            const text = input ? input.value.trim() : '';
            if(!text) return;

            const p = state.socialPosts.find(x => x.id === postId);
            if (p) {
                const c = p.comments.find(x => x.id === commentId);
                if (c) {
                    if(!c.replies) c.replies = [];
                    c.replies.push({
                        id: Date.now(),
                        author: state.currentUser.nickname,
                        text: text,
                        time: "방금",
                        likes: 0,
                        liked: false
                    });
                    c.showReplyInput = false;
                    renderSocialFeed();
                }
            }
        }

        function renderRecommendationRanking() {
            const counts = {};
            state.socialPosts.forEach(p => {
                if (p.category === '추천' && p.book) {
                    counts[p.book] = (counts[p.book] || 0) + 1;
                }
            });
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
            
            const container = document.getElementById('realtime-recommendation-list');
            if(!container) return;
            container.innerHTML = '';
            
            if(sorted.length === 0) {
                container.innerHTML = '<div class="text-xs text-gray-400 py-2">아직 추천된 도서가 없습니다. 자유게시판에 첫 추천글을 남겨보세요!</div>';
                return;
            }
            
            sorted.forEach((item, idx) => {
                const rankClass = idx < 3 ? 'text-brand-sage font-serif font-bold text-lg' : 'text-gray-400 font-serif font-bold text-base';
                container.innerHTML += `
                    <div class="flex justify-between items-center text-xs group cursor-pointer bg-brand-ivory/30 p-2.5 rounded-xl border border-transparent hover:border-brand-sage/30 hover:bg-brand-sageLight/20 transition-all" onclick="quickSearch('${item[0]}')">
                        <div class="flex items-center gap-3">
                            <span class="w-4 text-center ${rankClass}">${idx + 1}</span>
                            <span class="font-bold text-brand-navy group-hover:text-brand-sage transition-colors text-left line-clamp-1">${item[0]}</span>
                        </div>
                        <span class="text-[10px] text-brand-sageDark font-semibold bg-brand-sageLight px-2 py-0.5 rounded-full shadow-sm">${item[1]}회 추천</span>
                    </div>
                `;
            });
            lucide.createIcons();
        }

        function sayHelloToReader(name) { showToast(`${name}님에게 인사를 건넸습니다! 🙋`); }
        window.onload = function() {
            loadAppState();
            lucide.createIcons();
            updateUIProfileData();
            renderSocialFeed();
            renderRecommendationRanking();
            renderGatheringsGrid();
            renderMyPageGatherings();
            loadBookCover('채식주의자', 'home-question-cover', 'w-14 h-20 object-cover rounded-xl shadow-sm', 'https://image.aladin.co.kr/product/29137/2/cover500/8936434594_2.jpg', { title: '채식주의자', author: '한강', isbn: '9788936434595' });
            preloadBookCovers([...state.recentBooks, ...state.gatherings.map(g => ({ title: g.book, author: g.author, isbn: g.isbn, coverUrl: g.coverUrl }))]);
            
            // AI 채팅 초기화 호출
            resetAIChat();
            
            // 아카이브 섹션의 임시 이미지 적용 (미리 정의된 커버 또는 Typography로 표시됨)
            loadBookCover('사피엔스', 'archive-cover-sapiens', 'w-12 h-16 object-cover rounded shadow');
            loadBookCover('데미안', 'archive-cover-demian', 'w-12 h-16 object-cover rounded shadow');
            loadBookCover('도둑맞은 집중력', 'archive-cover-focus', 'w-12 h-16 object-cover rounded shadow');
            loadBookCover('도둑맞은 집중력', 'archive-cover-habits', 'w-12 h-16 object-cover rounded shadow');
        }

// BOOKMATE v1.9: Mission Reward Book Lounge
const OFFICIAL_LOUNGE_ASSET_PATH = 'assets/lounge-official/';
const LOUNGE_PROGRESS_KEY = 'bookmate_lounge_progress_v1_9';
const LOUNGE_BOOKMATES_KEY = 'bookmate_lounge_bookmates_v1_9_2';

const OFFICIAL_LOUNGE_LABELS = {
  shelf: '책장',
  frame: '액자',
  plant: '화분',
  snack: '다과세트',
  clock: '벽시계'
};
const OFFICIAL_LOUNGE_CATS = {
  cat1: { name: '모아1', src: 'cat-white-trim.png', slot: '기본 모아' },
  cat2: { name: '모아2', src: 'cat-calico-trim.png', slot: '북메이트 보상' },
  cat3: { name: '모아3', src: 'cat-siam-trim.png', slot: '독서모임 보상' },
  cat4: { name: '모아4', src: 'cat-cheese-trim.png', slot: '실시간 참여 보상' }
};

const LOUNGE_MISSIONS = [
  { key: 'shelf', kind: 'sticker', title: '첫 완독', reward: '책장', metric: 'completedBooks', goal: 1 },
  { key: 'frame', kind: 'sticker', title: '소속도서관 인증', reward: '액자', metric: 'libraryVerified', goal: 1 },
  { key: 'clock', kind: 'sticker', title: 'AI 1:1토론 3회', reward: '시계', metric: 'aiDebates', goal: 3 },
  { key: 'plant', kind: 'sticker', title: '토론방 글 5회', reward: '화분', metric: 'discussionPosts', goal: 5 },
  { key: 'cat2', kind: 'cat', title: '북메이트 3명 달성', reward: '모아2', metric: 'bookmates', goal: 3 },
  { key: 'cat3', kind: 'cat', title: '독서모임 5개 가입', reward: '모아3', metric: 'joinedGatherings', goal: 5 },
  { key: 'snack', kind: 'sticker', title: '방명록 남기기 5회', reward: '다과세트', metric: 'guestbookWrites', goal: 5 },
  { key: 'cat4', kind: 'cat', title: '온라인 모임 실시간 10회 참여', reward: '모아4', metric: 'liveMeetings', goal: 10 }
];

const DEFAULT_BOOKMATES = [
  { name: '사유올빼미', status: 'active', since: '2026.05.13', gathering: '추리소설 읽기', avatarType: 'moa', avatarId: 2 },
  { name: '한줄수집가', status: 'active', since: '2026.05.21', gathering: '고전문학 살롱', avatarType: 'moa', avatarId: 4 },
  { name: '지혜의등대', status: 'active', since: '2026.06.01', gathering: '그림책 산책', avatarType: 'moa', avatarId: 3 },
  { name: '초록책갈피', status: 'active', since: '2026.06.09', gathering: '에세이 클럽', avatarType: 'moa', avatarId: 2 },
  { name: '문장산책자', status: 'active', since: '2026.06.14', gathering: 'SF 북토크', avatarType: 'moa', avatarId: 1 }
];
let loungeBookmates = [];

function getDefaultLoungeProgress() {
  // 처음에는 기본 배경 + 모아1만 컬러로 보이도록 0에서 시작합니다.
  // 실제 서비스에서는 각 활동 완료 시 아래 localStorage 값 또는 서버 값을 갱신하면 자동으로 해금됩니다.
  return {
    completedBooks: Number(localStorage.getItem('bookmate_lounge_completed_books') || 0),
    libraryVerified: Number(localStorage.getItem('bookmate_lounge_library_verified') || 1),
    aiDebates: Number(localStorage.getItem('bookmate_lounge_ai_debates') || 3),
    discussionPosts: Number(localStorage.getItem('bookmate_lounge_discussion_posts') || 0),
    bookmates: getActiveBookmates().length || 0,
    joinedGatherings: Number(localStorage.getItem('bookmate_lounge_joined_gatherings') || 0),
    guestbookWrites: Number(localStorage.getItem('bookmate_lounge_guestbook_writes') || 0),
    liveMeetings: Number(localStorage.getItem('bookmate_lounge_live_meetings') || 0)
  };
}

function loadLoungeBookmates() {
  try {
    const saved = localStorage.getItem(LOUNGE_BOOKMATES_KEY);
    loungeBookmates = saved ? JSON.parse(saved) : DEFAULT_BOOKMATES.slice();
    loungeBookmates.forEach((m, idx) => { if (!m.avatarId) m.avatarId = ((idx + 1) % 4) + 1; normalizeAvatarTarget(m); });
  } catch (e) {
    loungeBookmates = DEFAULT_BOOKMATES.slice();
  }
}

function saveLoungeBookmates() {
  localStorage.setItem(LOUNGE_BOOKMATES_KEY, JSON.stringify(loungeBookmates));
}

function getActiveBookmates() {
  return (loungeBookmates || []).filter(m => m.status === 'active');
}

function getLoungeProgress() {
  const base = getDefaultLoungeProgress();
  try {
    const saved = JSON.parse(localStorage.getItem(LOUNGE_PROGRESS_KEY) || '{}');
    return { ...base, ...saved, libraryVerified: Math.max(Number(saved.libraryVerified || 0), base.libraryVerified), aiDebates: Math.max(Number(saved.aiDebates || 0), base.aiDebates), bookmates: getActiveBookmates().length };
  } catch (e) {
    return base;
  }
}

function isMissionAcquired(mission, progress) {
  return Number(progress[mission.metric] || 0) >= mission.goal;
}

function isLoungeLayerAcquired(layerKey, isCat) {
  if (layerKey === 'background' || layerKey === 'cat1') return true;
  const progress = getLoungeProgress();
  const mission = LOUNGE_MISSIONS.find(m => m.key === layerKey && (isCat ? m.kind === 'cat' : m.kind === 'sticker'));
  return mission ? isMissionAcquired(mission, progress) : false;
}

function getOfficialLoungeLayers() {
  return [
    { key: 'background', src: 'background.png', alt: '기본 배경', always: true },
    { key: 'plant', src: 'plant.png', alt: '화분' },
    { key: 'frame', src: 'frame.png', alt: '액자' },
    { key: 'clock', src: 'clock.png', alt: '벽시계' },
    { key: 'shelf', src: 'shelf.png', alt: '서가' },
    { key: 'snack', src: 'snack.png', alt: '다과 세트' },
    ...Object.entries(OFFICIAL_LOUNGE_CATS).map(([key, cat]) => ({
      key,
      src: cat.src,
      alt: `${cat.name} ${cat.slot}`,
      isCat: true
    }))
  ];
}

function buildOfficialLoungeHTML() {
  return getOfficialLoungeLayers().filter(layer => isLoungeLayerAcquired(layer.key, !!layer.isCat)).map(layer => {
    const catClass = layer.isCat ? ` official-lounge-layer--cat official-lounge-layer--${layer.key}` : '';
    return `<img class="official-lounge-layer official-lounge-layer--${layer.key}${catClass}" src="${OFFICIAL_LOUNGE_ASSET_PATH}${layer.src}" alt="${layer.alt}">`;
  }).join('');
}

function getMissionIconHTML(mission) {
  let src = '';
  if (mission.kind === 'cat') {
    src = OFFICIAL_LOUNGE_CATS[mission.key]?.src || '';
  } else {
    const fileMap = { shelf: 'shelf.png', frame: 'frame.png', clock: 'clock.png', plant: 'plant.png', snack: 'snack.png' };
    src = fileMap[mission.key] || '';
  }
  return src ? `<img src="${OFFICIAL_LOUNGE_ASSET_PATH}${src}" alt="${mission.reward}" class="lounge-mission-img">` : '';
}

function renderLoungeMissions() {
  const container = document.getElementById('lounge-mission-list');
  if (!container) return;
  const progress = getLoungeProgress();
  container.innerHTML = LOUNGE_MISSIONS.map((mission) => {
    const acquired = isMissionAcquired(mission, progress);
    return `<div class="lounge-mission-card ${acquired ? 'acquired' : ''}">
      <div class="lounge-mission-icon">${getMissionIconHTML(mission)}</div>
      <div class="lounge-mission-reward-name">${mission.reward}</div>
      <div class="lounge-mission-title">${mission.title}</div>
      <div class="lounge-mission-state">(${acquired ? '획득' : '미획득'})</div>
    </div>`;
  }).join('');
}

function renderBookmates() {
  const list = document.getElementById('lounge-bookmates-list');
  const modalList = document.getElementById('bookmates-modal-list');
  const active = getActiveBookmates();
  if (list) {
    list.innerHTML = active.map((m, idx) => `<div class="bookmate-card">
      ${getAvatarHTML(m, 'bookmate-avatar')}
      <div class="bookmate-name">${m.name}</div>
      <div class="bookmate-since">${m.since || '2026.06.01'}부터 북메이트</div>
      <div class="bookmate-gathering">함께하는 모임 : ${m.gathering || 'BOOKMATE 독서모임'}</div>
    </div>`).join('') || '<span class="text-xs text-gray-400">아직 등록된 북메이트가 없습니다.</span>';
  }
  if (modalList) {
    modalList.innerHTML = (loungeBookmates || []).map((m, idx) => {
      const pending = m.status === 'pending';
      return `<div class="flex items-center justify-between gap-3 p-3 rounded-2xl border border-brand-ivoryDark bg-brand-ivory/40">
        <div class="flex items-center gap-3 min-w-0">
          ${getAvatarHTML(m, 'w-9 h-9')}
          <div class="min-w-0">
            <div class="text-sm font-bold text-brand-navy truncate">${m.name}</div>
            <div class="text-[10px] text-gray-500">${pending ? '초대 수락 대기' : `${m.since || '2026.06.01'}부터 북메이트 · ${m.gathering || 'BOOKMATE 독서모임'}`}</div>
          </div>
        </div>
        <div class="flex gap-2 shrink-0">
          ${pending ? `<button onclick="acceptBookmate(${idx})" class="px-3 py-1.5 rounded-lg bg-brand-sage text-white text-[10px] font-bold">수락</button>` : ''}
          <button onclick="removeBookmate(${idx})" class="px-3 py-1.5 rounded-lg bg-white border border-brand-ivoryDark text-gray-500 text-[10px] font-bold">삭제</button>
        </div>
      </div>`;
    }).join('');
  }
}

function renderOfficialLounge() {
  const html = buildOfficialLoungeHTML();
  document.querySelectorAll('#official-lounge-main, #mypage-lounge-preview').forEach(container => {
    if (container) container.innerHTML = html;
  });

  renderLoungeMissions();
  renderBookmates();

  const progress = getLoungeProgress();
  const acquiredMissions = LOUNGE_MISSIONS.filter(m => isMissionAcquired(m, progress));
  const stageText = document.getElementById('official-lounge-stage-text');
  if (stageText) stageText.textContent = '나의 활동으로 채워지는 북라운지, 독서 인연을 늘려보세요.';

  const badge = document.getElementById('official-lounge-complete-badge');
  if (badge) badge.textContent = `북라운지 완성도 ${Math.round((acquiredMissions.length / LOUNGE_MISSIONS.length) * 100)}% · ${acquiredMissions.length}/${LOUNGE_MISSIONS.length} 아이템 획득`;

  const progressText = document.getElementById('lounge-progress-text');
  if (progressText) progressText.textContent = `북라운지 완성도 ${Math.round((acquiredMissions.length / LOUNGE_MISSIONS.length) * 100)}% · ${acquiredMissions.length}/${LOUNGE_MISSIONS.length} 아이템 획득`;

  const tags = document.getElementById('mypage-lounge-tags');
  if (tags) {
    const rewardNames = ['기본 배경', '모아1', ...acquiredMissions.map(m => m.reward)];
    tags.innerHTML = rewardNames.map(name =>
      `<span class="px-3 py-1.5 rounded-full bg-brand-ivory border border-brand-ivoryDark text-[10px] font-bold text-brand-navy">${name}</span>`
    ).join('');
  }
}

window.openBookmatesModal = function() {
  renderBookmates();
  const modal = document.getElementById('bookmates-modal');
  if (modal) modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
};

window.closeBookmatesModal = function() {
  const modal = document.getElementById('bookmates-modal');
  if (modal) modal.classList.add('hidden');
};

window.acceptBookmate = function(index) {
  if (!loungeBookmates[index]) return;
  loungeBookmates[index].status = 'active';
  saveLoungeBookmates();
  renderOfficialLounge();
  if (typeof showToast === 'function') showToast('북메이트 초대를 수락했습니다.');
};

window.removeBookmate = function(index) {
  if (!loungeBookmates[index]) return;
  loungeBookmates.splice(index, 1);
  saveLoungeBookmates();
  renderOfficialLounge();
  if (typeof showToast === 'function') showToast('북메이트를 삭제했습니다.');
};

window.toggleOfficialSticker = function() {
  if (typeof showToast === 'function') showToast('북라운지 아이템은 활동 달성 시 자동으로 배치됩니다.');
};
window.setOfficialCat = window.toggleOfficialSticker;
window.resetOfficialLounge = function() {
  localStorage.removeItem(LOUNGE_PROGRESS_KEY);
  loungeBookmates = DEFAULT_BOOKMATES.slice();
  saveLoungeBookmates();
  renderOfficialLounge();
  if (typeof showToast === 'function') showToast('북라운지 달성 현황을 데모 기본값으로 되돌렸습니다.');
};

loadLoungeBookmates();
setTimeout(renderOfficialLounge, 0);
