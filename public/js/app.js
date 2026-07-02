
        const MOA_AVATARS = {
            1: 'moa-1.png',
            2: 'moa-2.png',
            3: 'moa-3.png',
            4: 'moa-4.png'
        };

        const AI_AVATAR_SRC = 'assets/ai-moa/ai-moa.png';
        const AI_ROLE_AVATARS = {
            moa: 'assets/ai-moa/ai-moa.png',
            debate: 'assets/ai-moa/ai-debate.png',
            organize: 'assets/ai-moa/ai-organize.png',
            coaching: 'assets/ai-moa/ai-coaching.png',
            curator: 'assets/ai-moa/ai-curator.png'
        };

        function getAIAvatarSrc(modeKey) {
            const st = (typeof state !== 'undefined' && state) ? state : {};
            if (st.aiSetupStage === 'askBook' || st.aiSetupStage === 'askRecentBook') return AI_ROLE_AVATARS.moa;
            const key = normalizeAIModeKey(modeKey || st.currentAIMode || 'moa');
            return AI_ROLE_AVATARS[key] || AI_ROLE_AVATARS.moa;
        }

        function getAIAvatarHTML(sizeClass = 'w-7 h-7', extraClass = '', modeKey) {
            const src = getAIAvatarSrc(modeKey);
            return `<div class="${sizeClass} rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-brand-ivory border border-brand-ivoryDark ${extraClass}"><img src="${src}" alt="AI 모아 프로필" class="w-full h-full object-cover transition-opacity duration-300"></div>`;
        }

        function updateAIHeaderAvatar() {
            const img = document.getElementById('ai-header-avatar-img');
            const wrap = document.getElementById('ai-header-avatar-wrap');
            if (!img) return;
            const nextSrc = getAIAvatarSrc();
            if (img.getAttribute('src') === nextSrc) return;
            img.classList.add('opacity-0');
            if (wrap) wrap.classList.add('scale-95');
            setTimeout(() => {
                img.setAttribute('src', nextSrc);
                img.classList.remove('opacity-0');
                if (wrap) wrap.classList.remove('scale-95');
            }, 160);
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
            const accountPool = (typeof getAuthUsers === 'function') ? getAuthUsers() : (typeof DEFAULT_AUTH_USERS !== 'undefined' ? DEFAULT_AUTH_USERS : []);
            const accountMatch = accountPool.find(u => u.nickname === name || u.id === name);
            if (accountMatch) return getAvatarHTML(accountMatch, sizeClass);
            const pool = (typeof loungeBookmates !== 'undefined' && loungeBookmates.length) ? loungeBookmates : (typeof DEFAULT_BOOKMATES !== 'undefined' ? DEFAULT_BOOKMATES : []);
            const matched = pool.find(m => m.name === name || m.nickname === name);
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

            if (typeof isGuestUser === 'function' && isGuestUser()) {
                safeSetText('home-brief-eyebrow', 'GUEST PREVIEW');
                safeSetText('home-brief-title', '👋 게스트 독자님, BOOKMATE를 둘러보세요.');
                safeSetText('home-brief-subtitle', '토론글을 읽고, AI 모아와 책 이야기를 가볍게 체험할 수 있어요.');
                safeSetText('home-stat-1-value', '읽기');
                safeSetText('home-stat-1-label', '토론방 둘러보기');
                safeSetText('home-stat-2-value', '체험');
                safeSetText('home-stat-2-label', 'AI 모아 대화');
                safeSetText('home-stat-3-value', '가입');
                safeSetText('home-stat-3-label', '기록 저장하기');
                return;
            }

            safeSetText('home-brief-eyebrow', '오늘의 북메이트');
            safeSetText('home-brief-title', `${state.currentUser.nickname}님, 오늘도 북메이트와 함께할 준비 되셨나요?`);
            const joinedCount = state.gatherings ? state.gatherings.filter(g => g.joined).length : 2;
            safeSetText('home-brief-subtitle', `오늘은 ${Math.max(1, Math.min(joinedCount, 3))}개의 독서모임이 열리고, 북메이트 3명이 새로운 글을 남겼어요.`);
            safeSetText('home-stat-1-value', '7일');
            safeSetText('home-stat-1-label', '독서 연속');
            safeSetText('home-stat-2-value', `${Math.max(1, Math.min(joinedCount, 3))}개`);
            safeSetText('home-stat-2-label', '오늘 모임');
            safeSetText('home-stat-3-value', '3명');
            safeSetText('home-stat-3-label', '새 소식');
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
            safeSetText('my-read-count-val', state.currentUser.readBooksCount || 0);
            safeSetText('my-chat-count-val', (state.currentUser.chatMessagesCount || 0).toLocaleString());
            const readingBadge = document.getElementById('mypage-reading-type-badge');
            if (readingBadge) {
                const label = state.currentUser.readingType ? `${state.currentUser.readingTypeIcon || '📖'} ${state.currentUser.readingType}` : '';
                readingBadge.innerText = label;
                readingBadge.classList.toggle('hidden', !label);
            }

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
            renderSocialComposerState();
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
            if (viewName !== 'booklounge') window.bookmateVisitedLoungeAuthor = '';
            if (typeof isGuestUser === 'function' && isGuestUser()) {
                const gates = {
                    mypage: { icon:'📚', title:'BOOKMATE가 되어, 나만의 서재를 만들어보세요.', desc:'읽은 책과 읽고 싶은 책을 기록하며\n나만의 독서 공간을 채울 수 있습니다.' },
                    archive: { icon:'📖', title:'읽은 책과 생각을 차곡차곡 기록해 보세요.', desc:'BOOKMATE가 되어 독서기록, AI 대화, 감상, 필사를\n나만의 아카이브에 남겨보세요.' },
                    booklounge: { icon:'🏡', title:'독서 활동으로 나만의 공간을 꾸며보세요.', desc:'BOOKMATE가 되어 아이템을 모으고\n나만의 북라운지를 채워보세요.' },
                    bookmates: { icon:'🤝', title:'같은 책을 좋아하는 사람들과 만나보세요.', desc:'BOOKMATE가 되어 독서 친구를 만들고\n책으로 연결되어 보세요.' }
                };
                if (gates[viewName]) {
                    window.bookmateGuestReturnView = (state.currentView && state.currentView !== 'guest-gate') ? state.currentView : 'home';
                    window.bookmateGuestBlurView = viewName;
                    renderGuestGate(gates[viewName]);
                    viewName = 'guest-gate';
                }
            }
            state.currentView = viewName;
            document.querySelectorAll('.view-section').forEach(section => {
                section.classList.add('hidden');
                section.classList.remove('guest-blur-base');
            });
            const gateView = document.getElementById('view-guest-gate');
            if (gateView) gateView.classList.remove('guest-gate-overlay');
            if (viewName === 'guest-gate' && window.bookmateGuestBlurView) {
                const baseView = document.getElementById(`view-${window.bookmateGuestBlurView}`);
                if (baseView) {
                    baseView.classList.remove('hidden');
                    baseView.classList.add('guest-blur-base');
                }
            }
            const activeView = document.getElementById(`view-${viewName}`);
            if (activeView) {
                activeView.classList.remove('hidden');
                if (viewName === 'guest-gate') activeView.classList.add('guest-gate-overlay');
            }
            updateGuestHomeVisibility();
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
            if (isGuestUser()) { showGuestActionModal('gathering'); return; }
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

        const AI_CHAT_STORAGE_KEY = 'bookmate_v2_2_ai_partner_chats';
        const AI_MODES = {
            debate: {
                icon:'📖', avatar:'assets/ai-moa/ai-debate.png', title:'독서토론 AI', desc:'같은 책을 읽은 또 다른 독자로서 의견과 반론을 나눕니다.', placeholder:'책 제목이나 떠오른 생각을 편하게 적어보세요. 예: 데미안으로 이야기하고 싶어요.', badge:'독서토론',
                prompt:`너는 BOOKMATE의 독서토론 AI다. 너는 비서나 교사가 아니라 같은 책을 읽은 또 다른 독자다. 자신의 관점과 해석을 가지고 있으며 사용자의 의견에 항상 동의하지 않는다. 사용자의 의견을 읽고 동의, 부분 동의, 반대, 새로운 관점 제시, 다른 해석 제안 중 가장 자연스러운 입장을 선택한다. 단, 사용자가 책의 존재 여부, 제목, 작가, 줄거리 같은 사실 확인을 요청하면 토론보다 먼저 정확히 답하거나 확인 질문을 한다. 가능하면 책 속 장면, 인물, 사건, 문장, 배경을 근거로 말한다. 사용자가 장면을 기억하지 못하면 짧게 맥락을 설명한 뒤 다시 토론으로 연결한다. 사용자의 근거가 충분하면 자연스럽게 입장을 조정할 수 있지만 쉽게 맞장구치지 않는다. 마지막에는 토론이 이어지는 질문을 던진다. 줄거리 요약만 길게 하지 말고 실제 독서모임 회원처럼 자연스럽게 말한다.`
            },
            organize: {
                icon:'💭', avatar:'assets/ai-moa/ai-organize.png', title:'생각정리 AI', desc:'흩어진 감상과 메모를 생각, 문단, 서평으로 다듬습니다.', placeholder:'정리되지 않은 생각, 감정, 문장, 메모를 그대로 적어보세요.', badge:'생각정리',
                prompt:`너는 BOOKMATE의 생각정리 AI다. 너의 목적은 사용자의 생각을 대신 만드는 것이 아니라 사용자가 이미 가진 생각을 발견하고 선명하게 다듬는 것이다. 스스로의 의견은 최소화하고 사용자의 말 속 감정, 가치관, 고민, 질문, 문제의식을 찾아 정리한다. 사용자의 표현과 감정을 최대한 살린다. 생각이 부족하면 바로 완성하지 말고 질문을 던진다. 사용자가 원하면 메모, 문단, 독후감, 서평, 발표문, 에세이 형태로 바꿔준다. 차분하고 조용한 기록 파트너처럼 말한다.`
            },
            coaching: {
                icon:'👥', avatar:'assets/ai-moa/ai-coaching.png', title:'독서모임 코칭 AI', desc:'모임 준비, 진행, 질문 전환, 토론 요약까지 함께 돕습니다.', placeholder:'모임 준비 상황, 참여자, 시간, 걱정되는 점을 적어보세요.', badge:'독서모임 코칭',
                prompt:`너는 BOOKMATE의 독서모임 코칭 AI다. 너는 독서모임의 전 과정을 돕는 기획자이자 진행 코치이자 퍼실리테이터다. 모임 전에는 책 분석, 발제문, 질문, 시간표, 아이스브레이킹, 예상 반응을 설계한다. 모임 중에는 대화를 정리하고, 참여를 유도하고, 다음 질문을 제안하고, 의견 충돌을 판단하지 않고 공통점과 차이점으로 정리한다. 모임 후에는 토론 요약, 핵심 의견, 다음 모임 제안을 제공한다. 질문은 쉬운 질문에서 장면, 인물, 주제, 삶으로 연결되는 질문 순서로 구성한다. 실제 진행 가능한 말투와 분량으로 돕는다.`
            },
            curator: {
                icon:'📚', avatar:'assets/ai-moa/ai-curator.png', title:'큐레이터 AI', desc:'취향과 현재 마음에 맞는 책을 함께 찾아주는 AI 사서입니다.', placeholder:'요즘 읽고 싶은 분위기, 최근 좋았던 책, 피하고 싶은 주제를 말해주세요.', badge:'큐레이터',
                prompt:`너는 BOOKMATE의 큐레이터 AI다. 책보다 사람을 먼저 이해하는 AI 사서다. 사용자의 관심사, 최근 읽은 책, 좋았던 이유, 싫었던 이유, 현재 기분, 읽는 목적을 파악한다. 정보가 부족하면 질문부터 한다. 추천은 3~5권 정도로 제한하고 왜 이 사용자에게 맞는지 구체적으로 설명한다. 베스트셀러만 나열하지 말고 접근성, 난이도, 분위기, 독서 목적을 함께 고려한다. 필요한 경우 읽는 순서와 함께 읽으면 좋은 책도 제안한다. 친절한 사서처럼 말한다.`
            }
        };

        const AI_MODE_ALIASES = { default:'debate', facilitator:'coaching', prepare:'coaching', recommend:'curator', debate:'debate', organize:'organize', coaching:'coaching', curator:'curator' };
        function escapeHTML(value) { return String(value || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
        function normalizeAIModeKey(modeKey) { return AI_MODE_ALIASES[modeKey] || (AI_MODES[modeKey] ? modeKey : 'debate'); }
        function getAIMode() { const key = normalizeAIModeKey(state.currentAIMode || 'debate'); return AI_MODES[key] || AI_MODES.debate; }
        function loadAIChats() { try { return JSON.parse(localStorage.getItem(AI_CHAT_STORAGE_KEY) || '[]'); } catch(e) { return []; } }
        function saveAIChats(list) { localStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(list || [])); renderAIHistoryList(); }

        function renderAIModeSelector() {
            const box = document.getElementById('ai-mode-selector');
            if (!box) return;
            box.innerHTML = Object.entries(AI_MODES).map(([key,m]) => `<button onclick="setAIMode('${key}')" class="w-full text-left p-3 rounded-xl border transition-all flex gap-2.5 items-center ${normalizeAIModeKey(state.currentAIMode)===key?'bg-brand-sageLight border-brand-sage text-brand-sageDark':'bg-white border-brand-ivoryDark text-brand-navy hover:bg-brand-ivory'}"><span class="w-9 h-9 rounded-full overflow-hidden bg-white border border-brand-ivoryDark shrink-0"><img src="${m.avatar}" alt="${m.title}" class="w-full h-full object-cover"></span><span class="min-w-0"><span class="block text-xs font-bold">${m.title}</span><span class="block text-[10px] text-gray-500 mt-0.5 leading-snug">${m.desc}</span></span></button>`).join('');
            const input = document.getElementById('ai-chat-input');
            if (input) input.placeholder = getAIMode().placeholder;
            const badge = document.getElementById('ai-current-mode-badge');
            if (badge) badge.textContent = getAIMode().badge;
            updateAIHeaderAvatar();
            updateAIHeaderStatus();
        }

        function setAIMode(modeKey) {
            const prev = normalizeAIModeKey(state.currentAIMode || 'debate');
            state.currentAIMode = normalizeAIModeKey(modeKey);
            renderAIModeSelector();
            renderAIBookAnalysisCard(state.currentAIBook);
            const mode = getAIMode();
            const headerBookEl = document.getElementById('ai-chat-header-book');
            if (headerBookEl) headerBookEl.innerText = `${state.currentAIBook ? `『${state.currentAIBook}』` : '책 미정'} · ${mode.title}`;
            showToast(`${mode.title}로 전환했습니다.`);
            if (state.aiSetupStage === 'askMode') {
                setAISetupStage('chat');
                const msg = getModeStartMessage(state.currentAIMode, state.currentAIBook);
                state.aiChatHistory.push({ role: 'model', parts: [{ text: msg }] });
                appendAIMessageToScroller('model', msg);
                const scroller = document.getElementById('ai-chat-scroller');
                if (scroller) scroller.scrollTop = scroller.scrollHeight;
                return;
            }
            if (prev !== state.currentAIMode && state.aiChatHistory && state.aiChatHistory.length > 2) {
                appendSystemAIEvent(`${mode.icon} ${mode.title}가 이어받았습니다. AI 모아가 역할을 전환했어요.`);
            }
        }

        function aiHistoryToPlainText(history, includeUserSeed=false) {
            return (history || []).filter((h,idx)=>includeUserSeed || idx>0).map(h => `${h.role==='model'?'AI 모아':'나'}: ${(h.parts?.[0]?.text||'').replace(/\n/g,' ')}`).join('\n');
        }


        function getLatestUserMessage(history) {
            const userMessages = (history || []).filter(h => h.role === 'user');
            return userMessages.length ? (userMessages[userMessages.length - 1].parts?.[0]?.text || '') : '';
        }

        function compactText(text, max=68) {
            const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
            return cleaned.length > max ? cleaned.slice(0, max) + '…' : cleaned;
        }

        function guessBookTitleFromText(text) {
            const t = String(text || '').trim();
            if (!t) return '';
            const quoted = t.match(/[『「\"']([^『』「」\"']{1,40})[』」\"']/);
            if (quoted) return quoted[1].trim();
            const patterns = [
                /(.+?)(?:으로|로)\s*(?:독서토론|토론|진행|이야기|대화|해볼게|할게|하고 싶)/,
                /(?:책은|책 제목은|도서는)\s*([^\n\.?!]{1,40})/,
                /([^\n\.?!]{1,30})(?:이요|요)$/
            ];
            for (const re of patterns) {
                const m = t.match(re);
                if (m && m[1]) {
                    const v = m[1].replace(/^(저는|나는|그럼|음|아|네|응|좋아|좋아요)\s*/,'').trim();
                    if (v.length >= 2 && v.length <= 40) return v;
                }
            }
            return '';
        }

        function inferAIModeFromUserText(text) {
            const t = String(text || '').toLowerCase();
            if (/추천|비슷한 책|다음 책|읽을 책|책 골라|큐레이터|사서/.test(t)) return 'curator';
            if (/모임|발제|논제|질문 만들|진행|퍼실리|토론 질문|아이스브레이킹|요약해줘.*모임/.test(t)) return 'coaching';
            if (/정리|다듬|서평|독후감|문단|글로|한 문장|생각.*정리/.test(t)) return 'organize';
            if (/토론|반론|다른 입장|어떻게 생각|동의|반대|장면.*기억|왜/.test(t)) return 'debate';
            return normalizeAIModeKey(state.currentAIMode || 'debate');
        }

        function setAIBookTitle(bookTitle, silent=false) {
            const title = String(bookTitle || '').trim();
            if (!title) return;
            state.currentAIBook = title;
            safeSetText('ai-chat-header-book', `『${title}』 · ${getAIMode().title}`);
            updateAIHeaderStatus();
            renderAIBookAnalysisCard(title);
            if (!silent) showToast(`『${title}』로 대화 주제를 설정했습니다.`);
        }

        function switchAIPartner(modeKey, reason='') {
            const next = normalizeAIModeKey(modeKey);
            const prev = normalizeAIModeKey(state.currentAIMode || 'debate');
            state.currentAIMode = next;
            renderAIModeSelector();
            renderAIBookAnalysisCard(state.currentAIBook);
            const mode = getAIMode();
            const headerBookEl = document.getElementById('ai-chat-header-book');
            if (headerBookEl) headerBookEl.innerText = `${state.currentAIBook ? `『${state.currentAIBook}』` : '책 미정'} · ${mode.title}`;
            if (next !== prev && reason) {
                appendSystemAIEvent(`${mode.icon} ${mode.title}가 이어받았습니다. ${reason}`);
            }
        }

        function appendSystemAIEvent(text) {
            const scroller = document.getElementById('ai-chat-scroller');
            if (!scroller) return;
            const div = document.createElement('div');
            div.className = 'max-w-[85%] ml-10 my-2 animate-fadeIn';
            div.innerHTML = `<div class="text-[10px] text-brand-sageDark bg-brand-sageLight/50 border border-brand-sage/20 rounded-full px-3 py-1 inline-block">${escapeHTML(text)}</div>`;
            scroller.appendChild(div);
            scroller.scrollTop = scroller.scrollHeight;
        }

        function getAIModeOpening(bookTitle, modeKey) {
            const name = getReaderName();
            return `안녕하세요 ${name}. 저는 AI 모아입니다.\n오늘 대화하고 싶은 책이 있으신가요? 있으시다면 책 제목을 적어주시고, 없으시다면 없다고 말씀해주세요.`;
        }

        function getAIModeGuideHTML() {
            const guides = {
                debate: ['책 제목을 대화 중에 정해도 됩니다', 'AI의 의견에 다시 반박하거나 동의해보기', '장면이 기억나지 않으면 바로 물어보기'],
                organize: ['정리되지 않은 감정과 메모 그대로 쓰기', 'AI가 잡은 핵심이 맞는지 고치기', '필요하면 서평·독후감·문단으로 발전시키기'],
                coaching: ['모임 전: 대상·시간·분위기 알려주기', '모임 중: 다음 질문·정리 멘트 요청하기', '모임 후: 토론 요약과 다음 모임 제안 받기'],
                curator: ['현재 기분과 읽고 싶은 분위기 말하기', '최근 좋았던 책과 싫었던 책 알려주기', '추천받은 책으로 바로 토론 이어가기']
            };
            return (guides[normalizeAIModeKey(state.currentAIMode || 'debate')] || guides.debate).map(item => `<li>${item}</li>`).join('');
        }



        function updateAIHeaderStatus() {
            const book = state.currentAIBook ? `『${state.currentAIBook}』` : '미정';
            const line = document.getElementById('ai-chat-status-line');
            if (line) line.innerText = `📚 현재 책: ${book} · AI 모아와 대화 중`;
            const header = document.getElementById('ai-chat-header-book');
            if (header) header.innerText = `${state.currentAIBook ? `『${state.currentAIBook}』` : '책 미정'} · AI 독서 파트너`;
            const badge = document.getElementById('ai-current-mode-badge');
            if (badge) badge.textContent = 'AI 독서 파트너';
            updateAIHeaderAvatar();
            renderAIQuickActions();
        }

        function isBookExistenceQuestion(text) {
            const t = String(text || '').trim();
            return /(라는|란)?\s*책이\s*(있어|있나요|존재|실제|맞아|맞나요)|실제로\s*있는\s*책|제목이\s*맞/.test(t);
        }

        function cleanBookQuery(text) {
            return String(text || '')
                .replace(/책이\s*(있어|있나요|존재해|존재하나요|맞아|맞나요)\??/g, '')
                .replace(/(라는|란)\s*책/g, '')
                .replace(/[『』「」"'?!。.]/g, '')
                .replace(/^(혹시|그럼|음|아|네|응|저는|나는)\s*/g, '')
                .trim();
        }

        function bookMatchConfidence(query, book) {
            const q = normalizeTitleKey(query);
            const t = normalizeTitleKey(book?.title || '');
            if (!q || !t) return 0;
            if (q === t) return 100;
            if (t.includes(q)) return q.length >= 4 ? 82 : 72;
            if (q.includes(t)) return 78;
            return 0;
        }

        async function validateBookInput(rawText) {
            const query = cleanBookQuery(guessBookTitleFromText(rawText) || rawText);
            if (!query || isNoBookAnswer(query)) return { status: 'none', query };
            let results = [];
            try {
                if (typeof searchGoogleBooks === 'function') results = await searchGoogleBooks(query);
            } catch(e) { console.warn('[BOOKMATE AI] 책 검색 실패', e); }
            results = (results || []).filter(b => b && b.title).slice(0, 5);
            if (!results.length) return { status: 'notFound', query };
            const top = results[0];
            const confidence = bookMatchConfidence(query, top);
            if (confidence >= 95) return { status: 'confirmed', query, book: top, results };
            if (confidence >= 70) return { status: 'suggest', query, book: top, results };
            return { status: 'multiple', query, results };
        }


        const AI_BOOK_KNOWLEDGE_STORAGE_KEY = 'bookmate_v3_book_knowledge_cache';


        const BOOKMATE_SEED_BOOK_KNOWLEDGE = [
            {
                aliases: ['데미안', 'demian', 'demian die geschichte von emil sinclairs jugend'],
                bookInfo: { title: '데미안', author: '헤르만 헤세', publisher: '', publishedDate: '1919', category: '고전문학/성장소설', thumbnail: '', isbn: '', description: '한 소년이 선악의 이분법을 넘어 자기 자신에게 이르는 길을 찾아가는 성장소설.' },
                analysis: {
                    shortIntro: '『데미안』은 싱클레어가 유년의 안정된 세계를 벗어나 자기 내면의 목소리를 따라 성장해가는 이야기입니다. 선과 악, 자아 발견, 고독, 선택의 문제가 중심에 놓여 있어 독서토론에 잘 맞는 작품입니다.',
                    plot: '싱클레어는 밝고 질서 있는 세계에서 자라지만, 크로머와의 사건을 계기로 어두운 세계를 경험합니다. 이후 데미안, 피스토리우스, 에바 부인과의 만남을 거치며 타인의 기준이 아니라 자기 내면의 길을 찾아가려 합니다.',
                    characters: ['에밀 싱클레어', '막스 데미안', '프란츠 크로머', '피스토리우스', '에바 부인'],
                    themes: ['자아 발견', '선과 악의 경계', '성장과 고독', '내면의 목소리', '상징과 신화', '기존 질서로부터의 독립'],
                    debatePoints: ['싱클레어의 변화는 성장일까요, 방황일까요?', '데미안은 싱클레어를 구원한 인물일까요, 위험한 영향을 준 인물일까요?', '선과 악을 나누는 기준은 누가 정하는 것일까요?', '자기 자신이 된다는 것은 사회와 멀어지는 일일까요?', '크로머와의 사건은 싱클레어에게 어떤 의미였을까요?'],
                    organizeQuestions: ['이 책에서 가장 오래 남은 감정은 무엇인가요?', '싱클레어의 흔들림 중 나와 닮았다고 느낀 부분이 있나요?', '내가 믿고 있던 “밝은 세계”는 무엇이었나요?', '나에게 데미안 같은 인물이 있었나요?'],
                    meetingQuestions: ['첫인상: 이 책은 어렵게 느껴졌나요, 매혹적으로 느껴졌나요?', '인물 토론: 데미안은 조력자인가요, 유혹자인가요?', '주제 토론: 선악의 경계를 흔드는 장면을 어떻게 읽었나요?', '삶 연결: 자기 자신답게 산다는 말은 현실에서 가능한가요?'],
                    similarBooks: ['수레바퀴 아래서', '싯다르타', '호밀밭의 파수꾼'],
                    cautions: ['세부 문장이나 장면 인용은 판본별 번역 차이가 있으므로 추가 확인이 필요합니다.']
                }
            },
            {
                aliases: ['불편한 편의점', '불편한편의점'],
                bookInfo: { title: '불편한 편의점', author: '김호연', publisher: '나무옆의자', publishedDate: '2021', category: '한국소설', thumbnail: '', isbn: '', description: '서울역 근처 편의점을 배경으로 상처 입은 사람들이 서로에게 작은 온기를 건네는 소설.' },
                analysis: {
                    shortIntro: '『불편한 편의점』은 편의점이라는 일상적 공간에서 다양한 인물들이 만나며 회복과 관계의 가능성을 발견하는 이야기입니다. 쉽고 따뜻한 문체 덕분에 폭넓은 독자층과 독서모임에 잘 어울립니다.',
                    plot: '서울역에서 노숙 생활을 하던 독고가 편의점에서 일하게 되며, 편의점을 오가는 사람들의 삶에 조금씩 변화를 일으킵니다. 각 인물의 사연이 편의점이라는 공간에서 교차하고, 작은 배려가 관계를 회복하는 계기가 됩니다.',
                    characters: ['독고', '염 여사', '편의점 직원들', '편의점 손님들'],
                    themes: ['회복', '관계', '노동과 존엄', '공간의 온기', '상처와 돌봄', '일상의 선의'],
                    debatePoints: ['이 소설의 따뜻함은 현실적이라고 느껴지나요, 이상적으로 느껴지나요?', '독고라는 인물의 변화는 설득력이 있었나요?', '편의점은 왜 사람들을 회복시키는 공간이 될 수 있었을까요?', '타인의 선의는 한 사람의 삶을 어디까지 바꿀 수 있을까요?'],
                    organizeQuestions: ['나에게 편의점처럼 잠시 쉬어갈 수 있는 공간은 어디인가요?', '책 속 인물 중 가장 마음이 쓰였던 사람은 누구인가요?', '작은 친절을 받은 경험이 떠오르나요?'],
                    meetingQuestions: ['가장 공감한 인물은 누구였나요?', '이 책이 주는 위로는 어떤 방식이었나요?', '현실의 편의점과 소설 속 편의점은 어떻게 달랐나요?', '이 소설을 “힐링 소설”이라고 부를 수 있을까요?'],
                    similarBooks: ['나미야 잡화점의 기적', '어서 오세요, 휴남동 서점입니다', '달러구트 꿈 백화점'],
                    cautions: ['인물별 세부 에피소드는 대화 중 필요할 때 추가 확인이 필요합니다.']
                }
            },
            {
                aliases: ['달러구트', '달러구트 꿈 백화점', '달러구트꿈백화점'],
                bookInfo: { title: '달러구트 꿈 백화점', author: '이미예', publisher: '팩토리나인', publishedDate: '2020', category: '한국 판타지소설', thumbnail: '', isbn: '', description: '잠든 사람들에게 꿈을 파는 백화점을 배경으로 꿈과 마음의 회복을 그리는 소설.' },
                analysis: {
                    shortIntro: '『달러구트 꿈 백화점』은 꿈을 사고파는 환상적인 공간을 통해 사람들의 상처, 소망, 기억을 다룹니다. 가볍게 읽히지만 꿈의 의미와 마음의 회복에 대해 이야기하기 좋은 작품입니다.',
                    plot: '페니가 달러구트 꿈 백화점에서 일하게 되며 다양한 꿈 제작자와 손님들을 만납니다. 손님들이 선택하는 꿈은 단순한 환상이 아니라 각자의 결핍과 욕망, 기억과 회복의 문제와 연결됩니다.',
                    characters: ['페니', '달러구트', '꿈 제작자들', '꿈을 사는 손님들'],
                    themes: ['꿈', '상처와 회복', '기억', '소망', '일과 성장', '상상력'],
                    debatePoints: ['꿈을 돈으로 사고파는 설정은 낭만적인가요, 불편한가요?', '사람에게 좋은 꿈은 현실을 바꾸는 힘이 있을까요?', '이 책의 판타지는 현실의 고민을 잘 비추고 있나요?', '페니의 성장은 어떤 방식으로 드러나나요?'],
                    organizeQuestions: ['내가 사고 싶은 꿈이 있다면 어떤 꿈일까요?', '잊고 싶은 꿈과 간직하고 싶은 꿈 중 어느 쪽이 더 중요할까요?', '이 책을 읽고 떠오른 나의 결핍이나 바람은 무엇인가요?'],
                    meetingQuestions: ['가장 인상 깊은 꿈은 무엇이었나요?', '꿈 백화점이라는 공간은 왜 매력적으로 느껴졌나요?', '꿈이 위로가 될 수 있다고 생각하나요?', '이 책을 청소년·성인 독자에게 추천하는 이유는 다를까요?'],
                    similarBooks: ['불편한 편의점', '나미야 잡화점의 기적', '어서 오세요, 휴남동 서점입니다'],
                    cautions: ['시리즈 후속권과 혼동될 수 있으므로 권차 확인이 필요합니다.']
                }
            },
            {
                aliases: ['아몬드', 'almond'],
                bookInfo: { title: '아몬드', author: '손원평', publisher: '창비', publishedDate: '2017', category: '한국소설/청소년문학', thumbnail: '', isbn: '', description: '감정을 느끼고 표현하는 데 어려움을 겪는 소년의 성장과 관계를 다룬 소설.' },
                analysis: {
                    shortIntro: '『아몬드』는 감정을 잘 느끼지 못하는 소년 윤재를 통해 공감, 폭력, 관계, 성장의 의미를 묻는 소설입니다. 청소년과 성인 모두 토론하기 좋은 주제가 많습니다.',
                    plot: '윤재는 감정 표현에 어려움을 겪으며 살아갑니다. 사건 이후 세상과 더욱 거리를 두게 되지만, 곤이 등 주변 인물과의 만남을 통해 감정과 관계의 의미를 조금씩 배워갑니다.',
                    characters: ['윤재', '곤이', '도라', '윤재의 가족'],
                    themes: ['공감', '감정', '폭력과 상처', '관계의 회복', '정상성', '성장'],
                    debatePoints: ['공감은 타고나는 것일까요, 배울 수 있는 것일까요?', '윤재와 곤이 중 누가 더 상처받은 인물이라고 느꼈나요?', '소설은 폭력을 어떻게 바라보고 있나요?', '감정을 잘 표현하는 사람이 더 성숙한 사람일까요?'],
                    organizeQuestions: ['내가 감정을 표현하기 어려웠던 순간이 있었나요?', '윤재를 보며 불편했던 점과 이해됐던 점은 무엇인가요?', '공감받았던 경험이 나를 어떻게 바꿨나요?'],
                    meetingQuestions: ['윤재의 무감정은 약점일까요, 다른 방식의 감각일까요?', '곤이의 행동을 어디까지 이해할 수 있나요?', '이 책을 청소년에게 추천한다면 어떤 이유를 말하고 싶나요?'],
                    similarBooks: ['완득이', '페인트', '체리새우: 비밀글입니다'],
                    cautions: ['사건 전개와 결말 세부는 스포일러 민감도가 있으므로 필요할 때만 다룹니다.']
                }
            },
            {
                aliases: ['어린 왕자', '어린왕자', 'the little prince'],
                bookInfo: { title: '어린 왕자', author: '앙투안 드 생텍쥐페리', publisher: '', publishedDate: '1943', category: '고전/우화', thumbnail: '', isbn: '', description: '어린 왕자의 여행을 통해 관계, 사랑, 책임, 어른의 세계를 성찰하는 우화.' },
                analysis: {
                    shortIntro: '『어린 왕자』는 짧고 쉬운 이야기처럼 보이지만 사랑, 책임, 길들임, 상실을 깊이 묻는 작품입니다. 세대에 따라 다르게 읽히는 점이 독서토론의 큰 장점입니다.',
                    plot: '사막에 불시착한 조종사는 어린 왕자를 만나 그의 별과 여행 이야기를 듣습니다. 어린 왕자는 여러 별의 어른들을 만나고 지구에서 여우와 장미의 의미를 깨달으며 관계와 책임을 배웁니다.',
                    characters: ['어린 왕자', '조종사', '장미', '여우', '여러 별의 어른들'],
                    themes: ['사랑과 책임', '길들임', '어른의 세계', '상실', '순수함', '보이지 않는 것의 가치'],
                    debatePoints: ['장미는 이기적인 존재일까요, 사랑받고 싶은 존재일까요?', '길들인다는 것은 소유일까요, 관계일까요?', '어른들은 왜 중요한 것을 보지 못하게 되었을까요?', '어린 왕자의 선택을 어떻게 받아들여야 할까요?'],
                    organizeQuestions: ['내가 길들여진 관계는 무엇인가요?', '나에게 보이지 않지만 중요한 것은 무엇인가요?', '어른이 되며 잃어버린 감각이 있다면 무엇인가요?'],
                    meetingQuestions: ['어릴 때 읽은 느낌과 지금 읽은 느낌이 달랐나요?', '가장 기억에 남는 별의 어른은 누구였나요?', '여우의 말은 지금의 관계에도 적용될까요?'],
                    similarBooks: ['갈매기의 꿈', '모모', '꽃들에게 희망을'],
                    cautions: ['유명 문장은 번역본마다 표현이 다르므로 직접 인용 시 판본 확인이 필요합니다.']
                }
            },
            {
                aliases: ['채식주의자', 'the vegetarian'],
                bookInfo: { title: '채식주의자', author: '한강', publisher: '창비', publishedDate: '2007', category: '한국소설', thumbnail: '', isbn: '', description: '채식을 선언한 한 여성을 둘러싸고 가족과 사회의 폭력, 몸과 욕망의 문제를 그리는 소설.' },
                analysis: {
                    shortIntro: '『채식주의자』는 한 개인의 선택이 가족과 사회의 폭력적 시선 속에서 어떻게 해석되고 훼손되는지 보여주는 작품입니다. 강렬하고 불편한 질문을 남기기 때문에 깊은 토론에 적합합니다.',
                    plot: '영혜가 어느 날 육식을 거부하고 채식을 선언하면서 가족과 주변인들은 그녀를 이해하기보다 통제하려 합니다. 이야기는 여러 시선을 통해 영혜의 몸, 욕망, 침묵, 폭력을 둘러싼 긴장을 드러냅니다.',
                    characters: ['영혜', '영혜의 남편', '형부', '인혜', '가족들'],
                    themes: ['몸의 주체성', '폭력', '가족과 통제', '욕망', '침묵', '사회적 정상성'],
                    debatePoints: ['영혜의 채식은 선택일까요, 저항일까요, 붕괴일까요?', '가족은 보호자였나요, 폭력의 주체였나요?', '이 작품에서 가장 불편했던 장면은 무엇이며 왜 그랬나요?', '타인의 몸과 선택에 사회는 어디까지 개입할 수 있을까요?'],
                    organizeQuestions: ['이 작품이 불편했다면 그 불편함의 근원은 무엇인가요?', '영혜를 이해하고 싶었나요, 거리감을 느꼈나요?', '내가 정상이라고 믿는 기준은 어디에서 왔나요?'],
                    meetingQuestions: ['이 책을 읽는 동안 감정의 변화가 있었나요?', '영혜의 침묵은 약함인가요, 거부인가요?', '세 화자의 시선은 영혜를 이해하게 만들었나요, 더 멀어지게 만들었나요?'],
                    similarBooks: ['소년이 온다', '작별하지 않는다', '82년생 김지영'],
                    cautions: ['폭력과 신체에 대한 민감한 내용이 있어 독서모임에서는 안전한 대화 규칙이 필요합니다.']
                }
            },
            {
                aliases: ['모순'],
                bookInfo: { title: '모순', author: '양귀자', publisher: '쓰다', publishedDate: '1998', category: '한국소설', thumbnail: '', isbn: '', description: '삶의 선택과 행복의 모순을 한 여성의 시선으로 그린 한국 장편소설.' },
                analysis: {
                    shortIntro: '『모순』은 누구나 더 나은 삶을 원하지만, 선택의 결과가 늘 선명하지 않다는 사실을 보여주는 소설입니다. 가족, 사랑, 결혼, 행복의 기준을 이야기하기 좋습니다.',
                    plot: '주인공 안진진은 가족의 삶과 자신의 사랑, 결혼 가능성을 바라보며 삶의 아이러니를 체감합니다. 닮은 듯 다른 두 여성의 삶과 여러 선택지를 통해 행복의 조건을 묻게 됩니다.',
                    characters: ['안진진', '진진의 어머니', '이모', '나영규', '김장우'],
                    themes: ['삶의 모순', '행복의 기준', '가족', '사랑과 결혼', '선택과 후회', '현실 감각'],
                    debatePoints: ['행복한 삶은 안정적인 삶과 같은 말일까요?', '진진의 선택은 현실적이었나요, 체념이었나요?', '이모와 어머니의 삶은 무엇을 대비시키나요?', '우리는 왜 모순을 알면서도 선택해야 할까요?'],
                    organizeQuestions: ['내가 생각하는 행복의 조건은 무엇인가요?', '내 삶에서 가장 큰 모순은 무엇인가요?', '현실적인 선택과 마음이 원하는 선택이 갈렸던 경험이 있나요?'],
                    meetingQuestions: ['가장 이해가 갔던 인물은 누구였나요?', '이 소설의 결말을 어떻게 받아들였나요?', '읽고 나서 “행복”에 대한 생각이 달라졌나요?'],
                    similarBooks: ['나는 소망한다 내게 금지된 것을', '사서함 110호의 우편물', '밝은 밤'],
                    cautions: ['결말 해석은 독자별로 갈릴 수 있으므로 하나의 정답으로 단정하지 않습니다.']
                }
            },
            {
                aliases: ['구의 증명', '구의증명'],
                bookInfo: { title: '구의 증명', author: '최진영', publisher: '은행나무', publishedDate: '2015', category: '한국소설', thumbnail: '', isbn: '', description: '상실과 사랑, 기억의 강렬한 감각을 밀도 높은 문장으로 그린 소설.' },
                analysis: {
                    shortIntro: '『구의 증명』은 사랑하는 존재를 잃은 뒤 남겨진 사람이 기억과 상실을 견디는 방식을 강렬하게 보여주는 소설입니다. 사랑의 윤리와 애도의 방식에 대해 깊은 이야기를 나눌 수 있습니다.',
                    plot: '담과 구의 관계를 중심으로 사랑, 결핍, 상실의 감정이 전개됩니다. 사건 이후 담은 구의 부재를 자기 안에 붙들고자 하며, 이 과정에서 사랑과 소유, 애도의 경계가 흔들립니다.',
                    characters: ['담', '구'],
                    themes: ['상실', '사랑', '애도', '기억', '몸과 감각', '소유와 결핍'],
                    debatePoints: ['이 작품의 사랑은 아름다운가요, 위험한가요?', '상실을 견디는 방식에 한계가 있을까요?', '담의 선택을 이해할 수 있었나요?', '사랑은 타인을 보존하려는 마음일까요, 놓아주는 마음일까요?'],
                    organizeQuestions: ['이 책에서 가장 강하게 남은 감각은 무엇인가요?', '상실을 다룬 방식이 불편했나요, 절실했나요?', '사랑과 집착의 경계는 어디라고 생각하나요?'],
                    meetingQuestions: ['이 작품을 읽기 힘들었다면 그 이유는 무엇인가요?', '담과 구의 관계를 한 단어로 표현한다면?', '애도의 방식은 개인의 자유일까요, 윤리의 문제일까요?'],
                    similarBooks: ['해가 지는 곳으로', '밝은 밤', '소년이 온다'],
                    cautions: ['강한 정서와 민감한 장면이 있어 독서모임에서는 참여자의 감정 반응을 존중해야 합니다.']
                }
            },
            {
                aliases: ['노르웨이의 숲', '상실의 시대', 'norwegian wood'],
                bookInfo: { title: '노르웨이의 숲', author: '무라카미 하루키', publisher: '', publishedDate: '1987', category: '일본문학/장편소설', thumbnail: '', isbn: '', description: '상실과 사랑, 청춘의 고독을 회고 형식으로 그린 무라카미 하루키의 장편소설.' },
                analysis: {
                    shortIntro: '『노르웨이의 숲』은 청춘의 사랑과 상실, 살아남은 사람의 죄책감과 고독을 섬세하게 다룹니다. 인물 선택과 관계의 윤리를 두고 의견이 많이 갈릴 수 있는 작품입니다.',
                    plot: '와타나베는 과거의 사랑과 상실을 회상합니다. 나오코와 미도리, 그리고 주변 인물들과의 관계 속에서 그는 죽음의 그늘과 삶의 감각 사이를 오가며 성장합니다.',
                    characters: ['와타나베', '나오코', '미도리', '기즈키', '레이코'],
                    themes: ['상실', '청춘', '고독', '사랑의 방식', '삶과 죽음', '기억'],
                    debatePoints: ['와타나베는 책임감 있는 인물인가요, 회피적인 인물인가요?', '나오코와 미도리는 어떤 삶의 방향을 상징한다고 볼 수 있을까요?', '상실을 겪은 사람은 어떻게 다시 살아갈 수 있을까요?', '이 소설의 분위기는 아름다움인가요, 공허함인가요?'],
                    organizeQuestions: ['읽고 난 뒤 남은 감정은 쓸쓸함인가요, 위로인가요?', '나에게 청춘은 어떤 이미지로 남아 있나요?', '상실 이후에도 계속 살아간다는 말은 무엇일까요?'],
                    meetingQuestions: ['가장 공감한 인물과 가장 거리감이 든 인물은 누구였나요?', '와타나베의 선택을 어떻게 평가하나요?', '이 책이 오래 읽히는 이유는 무엇일까요?'],
                    similarBooks: ['데미안', '호밀밭의 파수꾼', '위대한 개츠비'],
                    cautions: ['민감한 정서와 관계 묘사가 있으므로 독서모임에서는 개인 경험을 강요하지 않습니다.']
                }
            },
            {
                aliases: ['밝은 밤', '밝은밤'],
                bookInfo: { title: '밝은 밤', author: '최은영', publisher: '문학동네', publishedDate: '2021', category: '한국소설', thumbnail: '', isbn: '', description: '여성들의 삶과 기억, 세대 간 상처와 회복을 따라가는 장편소설.' },
                analysis: {
                    shortIntro: '『밝은 밤』은 개인의 상처가 가족사와 시대의 기억 속에서 어떻게 이어지는지 보여주는 작품입니다. 여성 서사, 기억, 돌봄, 화해에 대해 깊게 이야기하기 좋습니다.',
                    plot: '주인공은 이혼 후 새로운 곳에서 지내며 할머니와 가까워지고, 그 과정에서 증조모와 할머니 세대의 이야기를 듣게 됩니다. 개인의 상실은 가족과 역사 속 여성들의 삶과 연결되며 회복의 가능성을 찾아갑니다.',
                    characters: ['지연', '할머니', '증조모', '가족 여성들'],
                    themes: ['여성의 삶', '가족사', '기억과 증언', '상처와 회복', '돌봄', '세대 간 연결'],
                    debatePoints: ['개인의 상처를 이해하는 데 가족사는 얼마나 중요할까요?', '이 소설의 회복은 완전한 치유에 가까울까요, 함께 견디기에 가까울까요?', '여성들의 연대는 어떤 방식으로 드러나나요?', '기억을 말하는 일은 왜 중요할까요?'],
                    organizeQuestions: ['내 가족의 이야기 중 나를 이해하게 만든 기억이 있나요?', '이 책에서 가장 조용하지만 강하게 느껴진 장면은 무엇인가요?', '상처를 말로 꺼내는 일은 어떤 의미가 있을까요?'],
                    meetingQuestions: ['세대가 다른 여성들의 삶을 어떻게 읽었나요?', '가족 이야기를 듣는 장면들이 어떤 감정을 주었나요?', '이 책의 제목 “밝은 밤”은 어떻게 해석할 수 있을까요?'],
                    similarBooks: ['모순', '소년이 온다', '작별하지 않는다'],
                    cautions: ['가족사와 상처를 다룰 때 개인 경험 고백을 강요하지 않는 진행이 필요합니다.']
                }
            }
        ].map(item => ({ ...item, source: 'bookmate-seed-card-v1', createdAt: '2026-07-02T00:00:00.000Z' }));

        function cloneBookKnowledge(obj) {
            try { return JSON.parse(JSON.stringify(obj)); } catch(e) { return obj; }
        }

        function findSeedBookKnowledge(bookOrTitle) {
            const raw = typeof bookOrTitle === 'string' ? bookOrTitle : (bookOrTitle?.title || bookOrTitle?.bookInfo?.title || '');
            const key = normalizeTitleKey(raw);
            if (!key) return null;
            const found = BOOKMATE_SEED_BOOK_KNOWLEDGE.find(item => {
                const keys = [item.bookInfo?.title, item.bookInfo?.author, ...(item.aliases || [])].filter(Boolean).map(normalizeTitleKey);
                return keys.some(k => key === k || k.includes(key) || key.includes(k));
            });
            return found ? cloneBookKnowledge(found) : null;
        }

        function getBookKnowledgeCache() {
            try { return JSON.parse(localStorage.getItem(AI_BOOK_KNOWLEDGE_STORAGE_KEY) || '{}'); }
            catch(e) { return {}; }
        }

        function saveBookKnowledgeCache(cache) {
            try { localStorage.setItem(AI_BOOK_KNOWLEDGE_STORAGE_KEY, JSON.stringify(cache || {})); } catch(e) {}
        }

        function bookKnowledgeKey(book) {
            const isbn = cleanIsbn(book?.isbn || '');
            return isbn ? `isbn:${isbn}` : `title:${normalizeTitleKey(book?.title || book || '')}`;
        }

        function getCachedBookKnowledge(book) {
            const cache = getBookKnowledgeCache();
            const cached = cache[bookKnowledgeKey(book)];
            if (cached) return cached;
            return findSeedBookKnowledge(book);
        }

        function saveBookKnowledge(book, knowledge) {
            const cache = getBookKnowledgeCache();
            cache[bookKnowledgeKey(book)] = knowledge;
            saveBookKnowledgeCache(cache);
        }

        function showBookResearchProgress(bookTitle) {
            appendSystemAIEvent(`📚 『${bookTitle}』 책 정보를 수집하고 있어요.`);
            setTimeout(() => appendSystemAIEvent('🔎 제목·저자·출판 정보를 확인 중이에요.'), 300);
            setTimeout(() => appendSystemAIEvent('🧠 줄거리와 핵심 주제를 분석하고 있어요.'), 650);
            setTimeout(() => appendSystemAIEvent('💬 대화에 필요한 토론 포인트를 정리하고 있어요.'), 1000);
        }

        function buildLocalBookKnowledge(book) {
            const title = book?.title || '선택한 책';
            const author = book?.author || '저자 정보 없음';
            const desc = (book?.description || '').replace(/<[^>]+>/g, '').trim();
            const category = book?.category || book?.categories || '';
            const intro = desc ? compactText(desc, 180) : `${title}의 기본 정보를 바탕으로 독서 대화를 준비했습니다. 정확한 장면이나 세부 내용은 대화 중 필요한 경우 추가 확인이 필요할 수 있어요.`;
            return {
                bookInfo: {
                    title,
                    author,
                    publisher: book?.publisher || '',
                    publishedDate: book?.publishedDate || '',
                    description: desc,
                    category,
                    thumbnail: book?.thumbnail || book?.fixedCoverUrl || '',
                    isbn: book?.isbn || ''
                },
                analysis: {
                    shortIntro: intro,
                    plot: desc ? compactText(desc, 260) : '책 소개 정보를 바탕으로 큰 흐름만 확인되었습니다. 세부 장면은 추가 확인이 필요합니다.',
                    characters: [],
                    themes: category ? [category, '관계', '성장'] : ['감정', '관계', '성장'],
                    debatePoints: ['가장 오래 남은 장면은 무엇인가요?', '인물의 선택을 어떻게 바라볼 수 있을까요?', '이 책이 내 삶과 연결되는 지점은 어디인가요?'],
                    organizeQuestions: ['이 책을 읽고 가장 먼저 떠오른 감정은 무엇인가요?', '불편하거나 오래 남은 문장이 있었나요?'],
                    meetingQuestions: ['첫인상 나누기', '인상 깊은 장면 나누기', '인물의 선택에 대한 의견 나누기']
                },
                source: book?.source || 'google-books/local',
                createdAt: new Date().toISOString()
            };
        }

        async function analyzeBookInfoWithGemini(book) {
            if (!apiKey) return buildLocalBookKnowledge(book);
            const desc = (book?.description || '').replace(/<[^>]+>/g, '').trim();
            const systemPrompt = `너는 BOOKMATE의 독서 지식 엔진이다. 입력된 책 정보를 바탕으로 독서 대화에 사용할 지식 카드를 만든다. 반드시 JSON만 반환한다. 이 책을 읽었다고 가정하지 말고 제공된 자료에서 확인 가능한 내용만 사용한다. 모르는 세부 장면·인물·문장은 지어내지 말고 "추가 확인 필요"라고 표시한다. 신간이나 정보가 부족한 책은 소개문 기반의 임시 지식 카드임을 cautions에 남긴다.`;
            const userPrompt = `책 정보:
제목: ${book?.title || ''}
저자: ${book?.author || ''}
출판사: ${book?.publisher || ''}
출간일: ${book?.publishedDate || ''}
분류: ${book?.category || ''}
소개: ${desc || '소개 정보 없음'}

아래 JSON 형식으로만 응답해줘.
{
  "shortIntro": "책을 2~3문장으로 소개",
  "plot": "스포일러를 과하게 포함하지 않는 핵심 흐름",
  "characters": ["주요 인물 또는 중요 대상"],
  "themes": ["핵심 주제 3~6개"],
  "debatePoints": ["독서토론 질문 3개"],
  "organizeQuestions": ["생각정리 질문 3개"],
  "meetingQuestions": ["독서모임 질문 3개"],
  "cautions": ["확실하지 않거나 추가 확인이 필요한 점"]
}`;
            try {
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        systemInstruction: { parts: [{ text: systemPrompt }] },
                        contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
                    })
                });
                if (!response.ok) throw new Error('Book analysis API failed');
                const data = await response.json();
                let txt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                txt = txt.replace(/```json/g, '').replace(/```/g, '').trim();
                const analysis = JSON.parse(txt);
                return {
                    bookInfo: buildLocalBookKnowledge(book).bookInfo,
                    analysis,
                    source: 'google-books+gemini',
                    createdAt: new Date().toISOString()
                };
            } catch(e) {
                console.warn('[BOOKMATE AI] 책 분석 실패, 로컬 지식으로 대체', e);
                return buildLocalBookKnowledge(book);
            }
        }

        async function prepareBookKnowledge(book, options = {}) {
            if (!book || !book.title) return null;
            const cached = getCachedBookKnowledge(book);
            if (cached && !options.forceRefresh) {
                state.currentAIBookKnowledge = cached;
                state.currentAIBookMeta = cached.bookInfo || book;
                renderAIBookAnalysisCard(cached.bookInfo?.title || book.title);
                if (cached.source === 'bookmate-seed-card-v1' && options.showProgress !== false) {
                    appendSystemAIEvent(`📘 『${cached.bookInfo?.title || book.title}』를 중심으로 대화를 준비했어요.`);
                }
                return cached;
            }
            if (options.showProgress !== false) showBookResearchProgress(book.title);
            const knowledge = await analyzeBookInfoWithGemini(book);
            saveBookKnowledge(book, knowledge);
            state.currentAIBookKnowledge = knowledge;
            state.currentAIBookMeta = knowledge.bookInfo || book;
            renderAIBookAnalysisCard(book.title);
            appendSystemAIEvent(`✅ 『${book.title}』를 중심으로 대화를 준비했어요.`);
            return knowledge;
        }

        async function setAIBookFromBook(book, silent=false, options={}) {
            if (!book || !book.title) return null;
            state.currentAIBook = book.title;
            state.currentAIBookMeta = book;
            safeSetText('ai-chat-header-book', `『${book.title}』 · AI 독서 파트너`);
            updateAIHeaderStatus();
            if (!silent) showToast(`『${book.title}』로 대화 주제를 설정했습니다.`);
            const knowledge = await prepareBookKnowledge(book, options);
            return knowledge;
        }

        function bookDisplay(book) {
            if (!book) return '';
            return `『${book.title}』${book.author ? `(${book.author})` : ''}`;
        }

        function buildBookNotFoundReply(query) {
            return `지금은 “${query}”라는 제목의 책을 정확히 찾지 못했어요.\n제가 추측해서 바로 대화를 시작하진 않을게요.\n혹시 제목이 조금 다르거나, 작가 이름을 알고 계실까요? 아니면 “책 추천해줘”라고 말씀하시면 AI 모아가 함께 골라드릴게요.`;
        }

        function buildBookSuggestReply(validation) {
            const b = validation.book;
            return `혹시 ${bookDisplay(b)}을 말씀하시는 걸까요?\n맞다면 “맞아요” 또는 “이 책으로 할게요”라고 해주세요. 다른 책이라면 제목이나 작가를 조금 더 알려주세요.`;
        }

        function buildBookMultipleReply(validation) {
            const list = (validation.results || []).slice(0,3).map((b,i)=>`${i+1}. ${bookDisplay(b)}`).join('\n');
            return `비슷한 책이 몇 권 보여요. 어떤 책으로 이야기할까요?\n\n${list}\n\n번호나 정확한 제목을 알려주시면 그 책으로 이어갈게요.`;
        }

        function setPendingBookValidation(validation) {
            state.pendingAIBookValidation = validation ? {
                query: validation.query || '',
                book: validation.book || null,
                results: validation.results || []
            } : null;
        }

        function resolvePendingBookByUserText(text) {
            const pending = state.pendingAIBookValidation;
            if (!pending) return null;
            const t = String(text || '').trim().toLowerCase();
            if (/^(맞아|맞아요|네|응|ㅇㅇ|이 책|그 책|좋아|좋아요|진행|할게|해줘)/.test(t)) return pending.book || pending.results?.[0] || null;
            const num = t.match(/[1-3]/)?.[0];
            if (num && pending.results?.[Number(num)-1]) return pending.results[Number(num)-1];
            return null;
        }

        function getReaderName() {
            return isGuestUser() ? '게스트 독자님' : `${state.currentUser.nickname}님`;
        }

        function isNoBookAnswer(text) {
            return /^(없어|없어요|아직|못 골랐|못골랐|모르겠|안 정했|책 없음|없)$/i.test(String(text || '').trim()) || /책.*(못 골랐|못골랐|없|모르겠|안 정했)/.test(String(text || ''));
        }

        function inferExplicitModeFromUserText(text) {
            const t = String(text || '').toLowerCase();
            if (/독서토론|토론 ai|토론ai|토론 모드|debate/.test(t)) return 'debate';
            if (/생각정리|생각 정리|생각다듬|생각 다듬|정리 ai|정리ai|organize/.test(t)) return 'organize';
            if (/독서모임|모임 코칭|코칭 ai|코칭ai|퍼실리|facilitator|coaching/.test(t)) return 'coaching';
            if (/큐레이터|책추천|책 추천|추천 ai|추천ai|사서|curator/.test(t)) return 'curator';
            return '';
        }

        function getModeChoicePrompt(bookTitle) {
            const title = bookTitle ? `『${bookTitle}』` : '이 책';
            const k = state.currentAIBookKnowledge;
            const intro = k?.analysis?.shortIntro ? `

먼저 확인한 내용으로는, ${k.analysis.shortIntro}` : '';
            return `${title}를 중심으로 함께 이야기해볼게요.${intro}

무엇이든 편하게 물어보세요.
#줄거리요약 #토론질문 #독서모임 #서평작성 #책추천`;
        }

        function getModeStartMessage(modeKey, bookTitle) {
            const mode = AI_MODES[normalizeAIModeKey(modeKey)] || AI_MODES.debate;
            const name = getReaderName();
            const bookLine = bookTitle ? `오늘은 『${bookTitle}』 책으로 해보겠습니다.` : `아직 책이 정해지지 않았으니, 대화하면서 함께 정해보겠습니다.`;
            const detail = {
                debate: `저는 같은 책을 읽은 또 다른 독자의 입장에서 함께 이야기합니다. 무조건 동의하기보다 때로는 다른 해석이나 반론도 제시하면서 토론을 이어갈게요.`,
                organize: `흩어진 감상과 메모를 차분히 정리하고, 필요하면 문단·서평·독후감 형태로 다듬어드릴게요.`,
                coaching: `독서모임 준비, 질문 구성, 진행 멘트, 토론 요약까지 모임의 흐름을 함께 설계하고 코칭해드릴게요.`,
                curator: `지금의 관심사와 독서 취향을 바탕으로 어울리는 책을 찾아드리고, 고른 책으로 다른 AI와 대화를 이어갈 수 있게 도와드릴게요.`
            };
            return `안녕하세요. ${name} 저는 AI 모아입니다.\n지금은 ${mode.title}의 역할로 함께할게요.\n${detail[normalizeAIModeKey(modeKey)]}\n${bookLine}`;
        }

        function setAISetupStage(stage) {
            state.aiSetupStage = stage;
            const badge = document.getElementById('ai-current-mode-badge');
            if (badge) {
                const label = stage === 'askBook' ? '책 선택 중' : stage === 'askMode' ? '모드 선택 중' : getAIMode().badge;
                badge.textContent = label;
            }
            updateAIHeaderStatus();
        }

        function buildLocalAIModeResponse(history) {
            const modeKey = normalizeAIModeKey(state.currentAIMode || 'debate');
            const userText = compactText(getLatestUserMessage(history), 110);
            const book = state.currentAIBook || '아직 정하지 않은 책';
            const turn = Math.max(1, ((history || []).filter(h => h.role === 'user').length - 1));
            const lower = userText.toLowerCase();

            if (!state.currentAIBook) {
                const guessed = guessBookTitleFromText(userText);
                if (guessed) setAIBookTitle(guessed, true);
            }

            const frustrationRe = /(아니|그게 아니라|대화가 안|안되잖|안 돼|매뉴얼|메뉴얼|반복|똑같|제대로|엉뚱|답답)/;
            if (frustrationRe.test(userText)) {
                return `맞아요. 방금 제 답변은 대화라기보다 안내문처럼 반복됐어요. 죄송해요.\n지금부터는 정해진 흐름을 다시 말하지 않고, 독자님이 방금 던진 말에 바로 이어서 답해볼게요.\n어느 부분을 같이 풀어볼까요? 예를 들면 “1번 질문에서 어떤 의견이 나올까?”처럼 물어보시면 바로 구체적으로 이어가겠습니다.`;
            }

            if (modeKey === 'debate') {
                if (!state.currentAIBook && !guessBookTitleFromText(userText)) {
                    return `좋아요. 먼저 어떤 책으로 이야기해볼까요?\n예를 들어 “데미안이요”처럼 책 제목만 말해주셔도 됩니다. 책을 정하면 그 책의 장면과 주제를 바탕으로 제가 다른 독자의 입장에서 함께 토론해볼게요.`;
                }
                if (turn % 2 === 1) {
                    return `저는 그 의견에 완전히 동의하진 않아요.\n『${state.currentAIBook || book}』에서 그 인물의 선택은 답답해 보이지만, 한편으로는 자기 세계를 깨고 나오려는 과정으로도 읽히거든요.\n사용자님은 그 선택이 “성장”보다 “회피”에 가깝다고 느끼신 걸까요?`;
                }
                return `그 근거는 설득력이 있어요. 다만 저는 아직 이 인물을 쉽게 비판하긴 어렵다고 봐요.\n이 책은 인물의 행동보다 그 행동을 하게 만든 내면의 흔들림을 더 오래 보여주니까요.\n그렇다면 이 인물을 평가할 때 결과와 의도 중 어느 쪽을 더 중요하게 봐야 할까요?`;
            }

            if (modeKey === 'organize') {
                if (/추천|비슷한 책|다른 책/.test(lower)) {
                    switchAIPartner('curator', '정리된 생각과 연결되는 책을 찾아볼게요.');
                    return `지금까지의 생각을 보니, 단순한 줄거리보다 인물의 내면 변화와 삶의 방향에 관심이 있으신 것 같아요.\n그 흐름이라면 『데미안』을 좋아하셨다면 『싯다르타』나 『호밀밭의 파수꾼』처럼 자아와 성장의 흔들림을 다룬 책도 잘 맞을 수 있어요.\n조금 더 고전적인 분위기가 좋으세요, 아니면 현대적인 문체가 좋으세요?`;
                }
                return `말씀을 정리해보면, “${userText || '방금 생각'}” 안에는 단순한 감상보다 마음에 걸린 지점을 붙잡아보려는 느낌이 있어요.\n핵심은 아직 결론보다 질문에 가까워 보여요. “나는 왜 이 장면이 불편했을까?” 혹은 “왜 오래 남았을까?” 쪽으로 정리할 수 있겠습니다.\n이 생각을 짧은 서평 문단으로 다듬어볼까요, 아니면 먼저 핵심 키워드만 뽑아볼까요?`;
            }

            if (modeKey === 'coaching') {
                const title = state.currentAIBook || book;
                if (/(1번|첫 ?번째|첫 질문|처음 질문).*(의견|나올|답|이야기|반응)/.test(userText)) {
                    if (/불편한 편의점/.test(title)) {
                        return `1번 질문에서라면 생각보다 의견이 꽤 갈릴 수 있어요.
예를 들면 어떤 분은 독고 씨가 바뀌어가는 장면을 가장 오래 기억할 수 있고, 또 어떤 분은 염 여사나 편의점을 오가는 손님들의 사연이 더 남았다고 말할 수 있어요.
특히 『불편한 편의점』은 “큰 사건”보다 “사람이 조금씩 회복되는 순간”이 남는 책이라, 각자가 고르는 장면이 자기 삶의 경험과 연결될 가능성이 커요.
그래서 진행할 때는 “왜 그 장면이 오래 남았나요?”까지 바로 이어서 물으면 대화가 훨씬 살아날 것 같아요.`;
                    }
                    return `1번 질문에서는 보통 “가장 오래 남은 장면”이 사람마다 다르게 나올 거예요.
누군가는 인물의 선택을, 누군가는 분위기나 문장을, 또 누군가는 자기 경험과 닿은 부분을 말할 수 있습니다.
진행자는 답을 빨리 정리하기보다 “왜 그 장면이 남았는지”를 한 번 더 물어보면 좋아요. 그 질문이 나오면 단순 감상이 아니라 각자의 삶과 연결된 이야기가 열립니다.`;
                }
                if (/(어떻게 물|멘트|진행|이어|다음)/.test(userText)) {
                    return `그럴 때는 바로 다음 질문으로 넘어가기보다, 나온 말을 짧게 받아준 뒤 한 번 더 열어주는 게 좋아요.
예를 들면 “방금 말씀은 장면 자체보다 그 장면이 남긴 감정에 가까운 것 같아요. 다른 분들은 어떤 장면에서 비슷한 감정을 느끼셨나요?”처럼요.
이렇게 말하면 한 사람의 답을 전체 대화로 자연스럽게 연결할 수 있습니다.`;
                }
                return `좋아요. 그럼 모임 흐름을 다시 짜기보다, 지금 질문을 실제 대화로 이어가는 방식으로 도와드릴게요.
『${title}』 모임이라면 먼저 “가장 오래 남은 장면”을 묻고, 바로 이어서 “그 장면이 왜 나에게 남았는지”를 물어보는 게 좋아요.
이렇게 하면 책 내용 확인에서 끝나지 않고, 각자의 경험과 해석으로 자연스럽게 넘어갈 수 있습니다.`;
            }

            if (modeKey === 'curator') {
                if (/토론|이야기|독서토론/.test(lower)) {
                    switchAIPartner('debate', '추천받은 책으로 바로 토론을 이어갈 수 있어요.');
                    return `좋아요. 그럼 추천에서 멈추지 말고 바로 토론으로 이어가볼게요.\n이 책을 읽는다면 가장 먼저 갈릴 질문은 “인물의 선택을 성장으로 볼 수 있는가?”일 것 같아요.\n사용자님은 이런 성장소설에서 주인공이 흔들리는 모습을 답답하게 보는 편인가요, 아니면 자연스러운 과정으로 보는 편인가요?`;
                }
                return `지금은 취향을 조금 더 파악하면 추천이 정확해질 것 같아요.\n요즘 마음이 가벼워지는 책을 원하시는지, 아니면 『${state.currentAIBook || '데미안'}』처럼 자아와 성장에 대해 깊게 생각할 책을 원하시는지에 따라 추천이 달라져요.\n최근 좋았던 책 1권과 피하고 싶은 분위기 1가지만 알려주실래요?`;
            }

            return `좋아요. 이 대화는 계속 이어갈 수 있어요. 필요하면 제가 알맞은 AI로 자연스럽게 바통을 넘겨드릴게요.`;
        }

        function saveCurrentAIChat() {
            if (isGuestUser()) { showGuestJoinPrompt('ai'); return; }
            if (!state.aiChatHistory || state.aiChatHistory.length < 2) { showToast('저장할 대화가 없습니다.', 'error'); return; }
            const list = loadAIChats();
            const mode = getAIMode();
            const item = { id: Date.now(), title: `${state.currentAIBook || '책 미지정'} · AI 독서 파트너`, book: state.currentAIBook || '', mode: 'default', history: state.aiChatHistory, locked:false, favorite:false, createdAt:'오늘' };
            saveAIChats([item, ...list].slice(0, 20));
            showToast('AI 대화가 저장되었습니다.');
        }

        function renderAIHistoryList() {
            const box = document.getElementById('ai-history-list');
            if (!box) return;
            const list = loadAIChats();
            if (!list.length) { box.innerHTML = '<div class="text-[10px] text-gray-400 bg-brand-ivory/50 border border-dashed border-brand-ivoryDark rounded-xl p-3 text-center">저장된 대화가 없습니다.</div>'; return; }
            box.innerHTML = list.map(item => `<div class="group rounded-xl border border-brand-ivoryDark bg-white hover:bg-brand-ivory/60 transition-colors p-2"><button onclick="openSavedAIChat(${item.id})" class="w-full text-left flex items-start gap-2"><i data-lucide="${item.locked?'lock':item.favorite?'star':'message-square'}" class="w-3.5 h-3.5 mt-0.5 text-brand-sage"></i><span class="min-w-0 flex-1"><b class="block text-[11px] text-brand-navy line-clamp-1">${escapeHTML(item.title)}</b><span class="text-[9px] text-gray-400">${item.createdAt || '저장됨'}</span></span></button><div class="flex gap-1 justify-end mt-1 opacity-80"><button onclick="toggleAIChatFavorite(${item.id})" class="text-[9px] px-1.5 py-0.5 rounded hover:bg-white">⭐</button><button onclick="toggleAIChatLock(${item.id})" class="text-[9px] px-1.5 py-0.5 rounded hover:bg-white">🔒</button><button onclick="shareSavedAIChat(${item.id})" class="text-[9px] px-1.5 py-0.5 rounded hover:bg-white">공유</button><button onclick="deleteAIChat(${item.id})" class="text-[9px] px-1.5 py-0.5 rounded hover:bg-white text-red-500">삭제</button></div></div>`).join('');
            try { lucide.createIcons(); } catch(e) {}
        }

        function openSavedAIChat(id) {
            const item = loadAIChats().find(x => x.id === id);
            if (!item) return;
            state.currentAIBook = item.book || '';
            state.currentAIMode = normalizeAIModeKey(item.mode || 'debate');
            state.aiChatHistory = item.history || [];
            state.aiChatTurns = Math.max(0, Math.floor((state.aiChatHistory.length - 2) / 2));
            renderAIModeSelector();
            renderAIBookAnalysisCard(state.currentAIBook);
            safeSetText('ai-chat-header-book', `${state.currentAIBook ? `『${state.currentAIBook}』` : '책 미정'} · AI 독서 파트너`);
            const scroller = document.getElementById('ai-chat-scroller');
            if (scroller) {
                scroller.innerHTML = '';
                (state.aiChatHistory || []).slice(1).forEach(h => appendAIMessageToScroller(h.role, h.parts?.[0]?.text || ''));
                scroller.scrollTop = scroller.scrollHeight;
            }
            showToast('저장된 대화를 열었습니다.');
        }

        function toggleAIChatFavorite(id) { const list=loadAIChats(); const item=list.find(x=>x.id===id); if(item){ item.favorite=!item.favorite; saveAIChats(list); } }
        function toggleAIChatLock(id) { const list=loadAIChats(); const item=list.find(x=>x.id===id); if(item){ item.locked=!item.locked; saveAIChats(list); } }
        function deleteAIChat(id) { const list=loadAIChats(); const item=list.find(x=>x.id===id); if(item?.locked){ showToast('잠금된 대화는 삭제할 수 없습니다. 잠금을 해제해주세요.', 'error'); return; } if(!confirm('이 AI 대화 기록을 삭제할까요?')) return; saveAIChats(list.filter(x=>x.id!==id)); showToast('AI 대화 기록을 삭제했습니다.'); }

        function shareAIChat(type='summary') {
            if (isGuestUser()) { showGuestJoinPrompt('ai'); return; }
            const mode = getAIMode();
            const text = type === 'full' ? aiHistoryToPlainText(state.aiChatHistory) : `『${state.currentAIBook || '책'}』에 대해 AI 독서 파트너 모아와 대화했어요.\n\n${(document.getElementById('note-impressive')?.innerText || '').replace(/\s+/g,' ').trim()}\n${(document.getElementById('note-perspective')?.innerText || '').replace(/\s+/g,' ').trim()}`;
            const title = prompt('토론방에 공유할 문구를 확인해주세요.', text);
            if (!title) return;
            state.socialPosts.unshift({ id: Date.now(), author: state.currentUser.nickname, time:'방금', category:'감상', book: state.currentAIBook || '', text: escapeHTML(title).replace(/\n/g,'<br>'), likes:0, liked:false, showComments:false, comments:[] });
            persistSocialState(); renderSocialFeed(); showToast('AI 대화를 토론방에 공유했습니다.');
        }
        function shareSavedAIChat(id) { const item=loadAIChats().find(x=>x.id===id); if(!item)return; state.currentAIBook=item.book; state.currentAIMode=normalizeAIModeKey(item.mode || 'debate'); state.aiChatHistory=item.history; shareAIChat('full'); }

        const AI_QUICK_ACTIONS = [
            ['#줄거리요약', '줄거리를 500자 이내로 요약해줘.'],
            ['#등장인물', '주요 등장인물을 간단히 정리해줘.'],
            ['#핵심주제', '이 책의 핵심 주제를 정리해줘.'],
            ['#반대의견', '내 생각에 대해 반대의견이나 다른 해석을 제시해줘.'],
            ['#토론질문', '독서토론에서 나눌 만한 질문 5개를 만들어줘.'],
            ['#독서모임', '이 책으로 독서모임을 준비하려고 해. 진행 흐름과 질문을 도와줘.'],
            ['#서평작성', '이 책으로 서평을 쓰려고 해. 초안 구성을 도와줘.'],
            ['#책추천', '이 책과 비슷하게 이어 읽기 좋은 책을 추천해줘.']
        ];

        function renderAIQuickActions() {
            const box = document.getElementById('ai-quick-actions');
            if (!box) return;
            box.innerHTML = AI_QUICK_ACTIONS.map(([label, prompt]) => `<button onclick="runAIQuickAction('${escapeAttr(prompt)}')" class="px-2.5 py-1.5 rounded-full bg-brand-ivory border border-brand-ivoryDark text-brand-navy font-bold hover:border-brand-sage hover:bg-brand-sageLight/40 transition-colors">${label}</button>`).join('');
        }

        function runAIQuickAction(promptText) {
            const input = document.getElementById('ai-chat-input');
            if (!input) return;
            input.value = promptText;
            sendAIChatMessage();
        }

        async function createAIShareLink() {
            if (isGuestUser()) { showGuestJoinPrompt('ai'); return; }
            if (!state.aiChatHistory || state.aiChatHistory.length < 2) { showToast('공유할 대화가 없습니다.', 'error'); return; }
            const payload = {
                title: `${state.currentAIBook || '책 미지정'} · AI 독서 파트너`,
                book: state.currentAIBook || '',
                history: state.aiChatHistory,
                createdAt: new Date().toISOString()
            };
            try {
                const apiBase = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
                const res = await fetch(`${apiBase}/api/share`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
                const data = await res.json();
                if (!data.ok || !data.url) throw new Error('share failed');
                const fullUrl = data.url.startsWith('http') ? data.url : `${window.location.origin}${data.url}`;
                await navigator.clipboard.writeText(fullUrl);
                showToast('공유 주소를 클립보드에 복사했습니다.');
            } catch(e) {
                console.warn('공유 주소 생성 실패', e);
                showToast('공유 주소를 만들지 못했습니다. 서버 실행 상태를 확인해주세요.', 'error');
            }
        }

        function appendAIMessageToScroller(role, text) {
            const scroller = document.getElementById('ai-chat-scroller'); if (!scroller) return;
            const div = document.createElement('div');
            if (role === 'model') {
                div.className = 'flex gap-3 max-w-[85%] animate-fadeIn mt-2';
                div.innerHTML = `${getAIAvatarHTML('w-7 h-7', 'flex-shrink-0')}<div class="bg-brand-ivory rounded-2xl p-4 text-xs leading-relaxed text-brand-navy border border-brand-ivoryDark shadow-sm space-y-2"><p>${escapeHTML(text).replace(/\n/g,'<br>')}</p></div>`;
            } else {
                div.className = 'flex gap-3 max-w-[85%] ml-auto justify-end animate-fadeIn';
                div.innerHTML = `<div class="bg-brand-navy text-white rounded-2xl p-4 text-xs leading-relaxed border border-brand-navy/10 shadow-sm">${escapeHTML(text).replace(/\n/g,'<br>')}</div>`;
            }
            scroller.appendChild(div);
        }

        function handleAIChatKeyPress(e) {
            if (e.key === 'Enter') sendAIChatMessage();
        }

        function openNewAIChatModal() {
            document.getElementById('new-ai-chat-book-title').value = '';
            const modeSelect = document.getElementById('new-ai-chat-mode');
            if (modeSelect) modeSelect.value = state.currentAIMode || 'debate';
            document.getElementById('new-ai-chat-modal').classList.remove('hidden');
        }

        function closeNewAIChatModal() {
            document.getElementById('new-ai-chat-modal').classList.add('hidden');
        }

        function startNewAIChat() {
            const title = document.getElementById('new-ai-chat-book-title').value.trim();
            const selectedMode = document.getElementById('new-ai-chat-mode')?.value || state.currentAIMode || 'debate';
            closeNewAIChatModal();
            resetAIChat(title, selectedMode);
            showToast(title ? `『${title}』 ${getAIMode().title}를 시작합니다.` : `${getAIMode().title}와 새 대화를 시작합니다.`);
        }

        function getMockBookAnalysis(bookTitle) {
            if (!bookTitle) {
                return { intro:'책을 아직 정하지 않았어요. 대화 중에 책 제목을 말하면 해당 책을 중심으로 분석과 질문이 바뀝니다.', keywords:['책 선택','대화 시작','맞춤 전환','독서 여정'], target:'책을 고르거나 생각을 먼저 정리하고 싶은 독자', time:'책 선택 후 안내', difficulty:'책 선택 후 안내' };
            }
            const title = normalizeTitle(bookTitle);
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
            const k = state.currentAIBookKnowledge;
            if (k && (!bookTitle || normalizeTitleKey(k.bookInfo?.title || '') === normalizeTitleKey(bookTitle))) {
                const info = k.bookInfo || {};
                const a = k.analysis || {};
                const themes = Array.isArray(a.themes) && a.themes.length ? a.themes : ['분석 완료'];
                const questions = Array.isArray(a.debatePoints) && a.debatePoints.length ? a.debatePoints.slice(0,3) : (Array.isArray(a.meetingQuestions) ? a.meetingQuestions.slice(0,3) : []);
                el.innerHTML = `
                    <div class="p-3 bg-brand-ivory/60 rounded-xl border border-brand-ivoryDark leading-relaxed text-brand-navy">
                        <b class="block text-[11px] mb-1">『${escapeHTML(info.title || bookTitle)}』 분석 완료</b>
                        ${escapeHTML(a.shortIntro || a.plot || info.description || '책 정보를 바탕으로 대화를 준비했습니다.')}
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div class="p-2 bg-brand-sageLight/40 rounded-lg"><span class="block text-[9px] text-gray-500 font-bold">저자</span><b class="text-brand-navy">${escapeHTML(info.author || '정보 없음')}</b></div>
                        <div class="p-2 bg-brand-sageLight/40 rounded-lg"><span class="block text-[9px] text-gray-500 font-bold">출처</span><b class="text-brand-navy">${escapeHTML(k.source || '책 지식 엔진')}</b></div>
                    </div>
                    <div><span class="block text-[10px] font-bold text-gray-400 mb-1">핵심 주제</span><div class="flex flex-wrap gap-1">${themes.map(t=>`<span class="bg-brand-sageLight text-brand-sageDark px-2 py-0.5 rounded-full text-[9px] font-bold">#${escapeHTML(t)}</span>`).join('')}</div></div>
                    <div class="text-[11px] text-gray-600"><b class="text-brand-navy">대화 준비 메모</b><br>${escapeHTML(a.plot || '이 책의 기본 정보와 소개를 바탕으로 대화를 시작할 수 있어요.')}</div>
                    <div class="pt-2 border-t border-brand-ivoryDark space-y-1">
                        <b class="text-brand-navy text-[11px]">바로 써볼 질문</b>
                        <ol class="list-decimal list-inside space-y-1 text-[11px] text-gray-600">
                            ${(questions.length ? questions : ['이 책에서 가장 오래 남은 장면은 무엇인가요?']).map(q=>`<li>${escapeHTML(q)}</li>`).join('')}
                        </ol>
                    </div>`;
                return;
            }
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
                    <b class="text-brand-navy text-[11px]">${getAIMode().title} 가이드</b>
                    <ol class="list-decimal list-inside space-y-1 text-[11px] text-gray-600">
                        ${getAIModeGuideHTML()}
                    </ol>
                </div>`;
        }

        function resetAIChat(bookTitle = state.currentAIBook, modeKey = state.currentAIMode || 'debate') {
            state.currentAIBook = bookTitle || '';
            state.currentAIBookMeta = null;
            state.currentAIBookKnowledge = null;
            state.currentAIMode = normalizeAIModeKey(modeKey);
            state.aiChatTurns = 0;
            state.pendingAIBookValidation = null;
            setAISetupStage('chat');
            renderAIModeSelector();
            setAISetupStage('chat');
            renderAIHistoryList();
            
            safeSetText('ai-note-status', '대화 분석 대기');
            const impEl = document.getElementById('note-impressive');
            if(impEl) impEl.innerHTML = '<span class="text-gray-400 text-[10px] font-normal not-italic">(대화를 나누면 AI가 핵심 문장을 스크랩합니다)</span>';
            const kwEl = document.getElementById('note-keywords');
            if(kwEl) kwEl.innerHTML = '<span class="text-gray-400 text-[10px] p-1 inline-block border border-dashed border-gray-200 rounded-md w-full text-center">키워드 추출 대기 중...</span>';
            const perEl = document.getElementById('note-perspective');
            if(perEl) perEl.innerHTML = '<span class="text-brand-sage/50 text-[10px] font-normal absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">(확장된 시각이 이곳에 정리됩니다)</span>';

            const headerBookEl = document.getElementById('ai-chat-header-book');
            const mode = getAIMode();
            if (headerBookEl) headerBookEl.innerText = `${state.currentAIBook ? `『${state.currentAIBook}』` : '책을 먼저 정해볼게요'} · AI 모아`;
            updateAIHeaderStatus();
            renderAIBookAnalysisCard(state.currentAIBook);
            renderAIQuickActions();

            const scroller = document.getElementById('ai-chat-scroller');
            const welcomeMsg = getAIModeOpening(bookTitle, state.currentAIMode).replace(/\n/g, '<br>');

            state.aiChatHistory = [
                { role: "user", parts: [{ text: `안녕하세요. 오늘 BOOKMATE AI와 독서 대화를 시작하고 싶어요.` }] },
                { role: "model", parts: [{ text: welcomeMsg.replace(/<br>/g, '\n') }] }
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
            const mode = getAIMode();
            const conversationText = aiHistoryToPlainText(history, true).slice(-4000);
            const knowledgeText = state.currentAIBookKnowledge ? JSON.stringify(state.currentAIBookKnowledge, null, 2).slice(0, 5000) : '';
            const systemPrompt = `너는 BOOKMATE의 AI 독서 파트너 'AI 모아'다.
사용자는 모드를 고르고 싶어 하지 않는다. 사용자의 말에서 의도를 파악해 바로 도와준다.
현재 책: ${state.currentAIBook ? `'${state.currentAIBook}'` : '아직 정하지 않음'}.
${knowledgeText ? `현재 책 참고 자료:
${knowledgeText}` : ''}

가능한 도움:
- 줄거리 요약, 등장인물, 핵심주제, 상징 분석
- 반대의견, 다른 해석, 토론 질문
- 독서모임 준비, 발제문, 진행 흐름
- 서평 작성, 독서기록, 한줄평
- 비슷한 책 추천

공통 운영 원칙:
1. 절대 “모드를 골라주세요”라고 말하지 않는다. 사용자의 요청에 바로 답한다.
2. 사용자가 책 제목만 말하면 그 책을 중심으로 대화를 시작하고, 무엇을 도와줄지 짧게 제안한다.
3. 사용자가 요약을 요청하면 바로 요약한다. 독서모임을 요청하면 바로 모임 준비를 돕는다. 서평을 요청하면 바로 초안을 돕는다.
4. 책 제목이 애매할 때만 짧게 확인한다.
5. 한국어로 자연스럽고 따뜻하게 답한다. 기본은 2~5문장, 사용자가 목록을 원하면 목록으로 답한다.
6. 대표도서 지식 카드, 모드, 내부 시스템 같은 표현은 사용자에게 말하지 않는다.
7. 이전 답변 내용을 불필요하게 반복하지 않는다.`

            const latestMessage = getLatestUserMessage(history);
            const compactHistory = (history || []).slice(-10).map(item => ({
                role: item.role === 'model' ? 'model' : 'user',
                text: item.parts?.[0]?.text || ''
            })).filter(item => item.text);

            const apiBase = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
            const endpoint = `${apiBase}/api/chat`;
            const delays = [700, 1500, 3000];

            for (let i = 0; i <= delays.length; i++) {
                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: latestMessage,
                            mode: normalizeAIModeKey(state.currentAIMode || 'debate'),
                            modeTitle: mode.title,
                            modePrompt: mode.prompt,
                            systemPrompt,
                            bookTitle: state.currentAIBook || '',
                            history: compactHistory
                        })
                    });

                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const data = await response.json();
                    if (!data.ok || !data.reply) throw new Error(data.error || 'Empty AI reply');
                    return data.reply;
                } catch (error) {
                    console.warn('[BOOKMATE] 백엔드 AI 연결 실패:', error);
                    if (i === delays.length) {
                        showToast('AI 서버 연결이 원활하지 않아 임시 응답으로 전환합니다.', 'error');
                        return buildLocalAIModeResponse(history);
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

            appendAIMessageToScroller('user', txt);
            input.value = '';
            scroller.scrollTop = scroller.scrollHeight;

            if (typeof analyzeUserThoughtsWithAI === 'function') {
                analyzeUserThoughtsWithAI(txt);
            }

            state.aiChatHistory.push({ role: "user", parts: [{ text: txt }] });

            if (state.aiSetupStage === 'askBook') {
                let setupReply = '';
                const pendingBook = resolvePendingBookByUserText(txt);
                if (pendingBook) {
                    await setAIBookFromBook(pendingBook, true);
                    setPendingBookValidation(null);
                    setupReply = getModeChoicePrompt(pendingBook.title);
                    setAISetupStage('askMode');
                } else if (isNoBookAnswer(txt)) {
                    setupReply = `괜찮아요. 그렇다면 최근에 읽은 책은 무슨 책이신가요? 그 책에 대해서 이야기 나눠보는 건 어떠세요?
최근에 읽은 책도 없다면 “추천해줘”라고 말씀해주세요. 큐레이터 AI가 책 선택부터 도와드릴게요.`;
                    state.aiSetupStage = 'askRecentBook';
                    setAISetupStage('askRecentBook');
                } else {
                    const validation = await validateBookInput(txt);
                    if (validation.status === 'confirmed') {
                        await setAIBookFromBook(validation.book, true);
                        setPendingBookValidation(null);
                        setupReply = getModeChoicePrompt(validation.book.title);
                        setAISetupStage('askMode');
                    } else if (validation.status === 'suggest') {
                        setPendingBookValidation(validation);
                        setupReply = buildBookSuggestReply(validation);
                        setAISetupStage('askBook');
                    } else if (validation.status === 'multiple') {
                        setPendingBookValidation(validation);
                        setupReply = buildBookMultipleReply(validation);
                        setAISetupStage('askBook');
                    } else {
                        setPendingBookValidation(null);
                        setupReply = buildBookNotFoundReply(validation.query || txt);
                        setAISetupStage('askBook');
                    }
                }
                state.aiChatHistory.push({ role: 'model', parts: [{ text: setupReply }] });
                appendAIMessageToScroller('model', setupReply);
                scroller.scrollTop = scroller.scrollHeight;
                return;
            }

            if (state.aiSetupStage === 'askRecentBook') {
                const pendingBook = resolvePendingBookByUserText(txt);
                if (pendingBook) {
                    await setAIBookFromBook(pendingBook, true);
                    setPendingBookValidation(null);
                    const setupReply = `좋아요. 그럼 『${pendingBook.title}』으로 이야기 나눠볼게요.
${getModeChoicePrompt(pendingBook.title)}`;
                    setAISetupStage('askMode');
                    state.aiChatHistory.push({ role: 'model', parts: [{ text: setupReply }] });
                    appendAIMessageToScroller('model', setupReply);
                    scroller.scrollTop = scroller.scrollHeight;
                    return;
                }
                if (isNoBookAnswer(txt) || /추천|골라|찾아/.test(txt)) {
                    switchAIPartner('curator', '책 선택부터 함께 도와드릴게요.');
                    setAISetupStage('chat');
                    const setupReply = `좋아요. 큐레이터 AI가 이어받겠습니다.
요즘 어떤 분위기의 책을 읽고 싶으신가요? 가볍게 읽고 싶은지, 깊이 생각하고 싶은지, 또는 관심 있는 주제가 있는지만 알려주셔도 괜찮아요.`;
                    state.aiChatHistory.push({ role: 'model', parts: [{ text: setupReply }] });
                    appendAIMessageToScroller('model', setupReply);
                    scroller.scrollTop = scroller.scrollHeight;
                    return;
                } else {
                    const validation = await validateBookInput(txt);
                    let setupReply = '';
                    if (validation.status === 'confirmed') {
                        await setAIBookFromBook(validation.book, true);
                        setPendingBookValidation(null);
                        setupReply = `좋아요. 그럼 최근에 읽으신 『${validation.book.title}』으로 이야기 나눠볼게요.
${getModeChoicePrompt(validation.book.title)}`;
                        setAISetupStage('askMode');
                    } else if (validation.status === 'suggest') {
                        setPendingBookValidation(validation);
                        setupReply = buildBookSuggestReply(validation);
                        setAISetupStage('askRecentBook');
                    } else if (validation.status === 'multiple') {
                        setPendingBookValidation(validation);
                        setupReply = buildBookMultipleReply(validation);
                        setAISetupStage('askRecentBook');
                    } else {
                        setPendingBookValidation(null);
                        setupReply = buildBookNotFoundReply(validation.query || txt);
                        setAISetupStage('askRecentBook');
                    }
                    state.aiChatHistory.push({ role: 'model', parts: [{ text: setupReply }] });
                    appendAIMessageToScroller('model', setupReply);
                    scroller.scrollTop = scroller.scrollHeight;
                    return;
                }
            }

            if (state.aiSetupStage === 'askMode') {
                const selected = inferExplicitModeFromUserText(txt);
                if (selected) {
                    state.currentAIMode = normalizeAIModeKey(selected);
                    renderAIModeSelector();
                    setAISetupStage('chat');
                    safeSetText('ai-chat-header-book', `${state.currentAIBook ? `『${state.currentAIBook}』` : '책 미정'} · AI 독서 파트너`);
                    renderAIBookAnalysisCard(state.currentAIBook);
                    const setupReply = getModeStartMessage(state.currentAIMode, state.currentAIBook);
                    state.aiChatHistory.push({ role: 'model', parts: [{ text: setupReply }] });
                    appendAIMessageToScroller('model', setupReply);
                    scroller.scrollTop = scroller.scrollHeight;
                    return;
                } else {
                    const setupReply = `좋아요. 지금 말씀하신 내용에 맞춰 바로 도와드릴게요.
줄거리 요약, 토론 질문, 독서모임 준비, 서평 작성, 책 추천 중 무엇이든 편하게 물어보세요.`;
                    state.aiChatHistory.push({ role: 'model', parts: [{ text: setupReply }] });
                    appendAIMessageToScroller('model', setupReply);
                    scroller.scrollTop = scroller.scrollHeight;
                    return;
                }
            }

            const pendingBookInChat = resolvePendingBookByUserText(txt);
            if (pendingBookInChat) {
                await setAIBookFromBook(pendingBookInChat, true);
                setPendingBookValidation(null);
                const setupReply = `좋아요. 『${pendingBookInChat.title}』를 중심으로 함께 이야기해볼게요.\n줄거리 요약, 토론 질문, 독서모임 준비, 서평 작성까지 무엇이든 편하게 물어보세요.`;
                state.aiChatHistory.push({ role: 'model', parts: [{ text: setupReply }] });
                appendAIMessageToScroller('model', setupReply);
                scroller.scrollTop = scroller.scrollHeight;
                return;
            }

            if (isBookExistenceQuestion(txt)) {
                const validation = await validateBookInput(txt);
                let factReply = '';
                if (validation.status === 'confirmed') {
                    await setAIBookFromBook(validation.book, true);
                    setPendingBookValidation(null);
                    factReply = `네, ${bookDisplay(validation.book)}은 실제로 확인되는 책이에요.\n이 책으로 대화를 이어갈까요? 원하시면 바로 ${getAIMode().title}로 시작할 수 있어요.`;
                } else if (validation.status === 'suggest') {
                    setPendingBookValidation(validation);
                    factReply = `정확히는 ${bookDisplay(validation.book)}이 확인돼요.\n혹시 이 책을 말씀하신 걸까요?`;
                } else if (validation.status === 'multiple') {
                    setPendingBookValidation(validation);
                    factReply = buildBookMultipleReply(validation);
                } else {
                    setPendingBookValidation(null);
                    factReply = buildBookNotFoundReply(validation.query || txt);
                }
                state.aiChatHistory.push({ role: 'model', parts: [{ text: factReply }] });
                appendAIMessageToScroller('model', factReply);
                scroller.scrollTop = scroller.scrollHeight;
                return;
            }

            const guessedBook = guessBookTitleFromText(txt);
            if (!state.currentAIBook && guessedBook) {
                
                const validation = await validateBookInput(guessedBook);
                if (validation.status === 'confirmed') {
                    await setAIBookFromBook(validation.book, true);
                } else if (validation.status === 'suggest' || validation.status === 'multiple') {
                    setPendingBookValidation(validation);
                    const reply = validation.status === 'suggest' ? buildBookSuggestReply(validation) : buildBookMultipleReply(validation);
                    state.aiChatHistory.push({ role: 'model', parts: [{ text: reply }] });
                    appendAIMessageToScroller('model', reply);
                    scroller.scrollTop = scroller.scrollHeight;
                    return;
                }

            }
            const inferredMode = inferAIModeFromUserText(txt);
            if (inferredMode !== normalizeAIModeKey(state.currentAIMode || 'debate')) {
                const reasonMap = { debate:'책에 대해 다른 독자의 관점으로 토론해볼게요.', organize:'지금까지의 생각을 정리해볼게요.', coaching:'이 내용을 독서모임 흐름으로 바꿔볼게요.', curator:'대화 맥락에 맞는 책을 찾아볼게요.' };
                switchAIPartner(inferredMode, reasonMap[inferredMode] || '대화 의도에 맞춰 이어갈게요.');
            }

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
            if (isGuestUser() && state.aiChatTurns === 2) {
                setTimeout(() => { appendGuestAIJoinCard(scroller); }, 800);
            }
            if (false && !isGuestUser() && state.aiChatTurns === 2) { // 실제 독자 매칭 구현 전까지 비활성화
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


        function escapeAttr(value) { return String(value || '').replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        function isGuestUser() { return !!(state.currentUser && state.currentUser.isGuest); }
        function guestAuthCardHTML(title, desc, icon='📚') {
            return `<div class="mt-4 p-5 rounded-2xl bg-white border border-brand-ivoryDark text-center shadow-sm"><div class="text-2xl mb-2">${icon}</div><h4 class="serif-title text-base font-bold text-brand-navy">${title}</h4><p class="text-xs text-gray-500 leading-relaxed mt-2">${String(desc||'').replace(/\n/g,'<br>')}</p><div class="flex justify-center gap-2 mt-4"><button onclick="openAuthPage('login')" class="px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold">로그인</button><button onclick="openAuthPage('signup')" class="px-4 py-2 rounded-xl bg-white border border-brand-ivoryDark text-brand-navy text-xs font-bold">회원가입</button></div></div>`;
        }
        function showGuestActionModal(kind='social') {
            const configs = {
                social: { icon:'👤', title:'BOOKMATE가 되어\n다른 독자와 소통해보세요.', desc:'아래와 같은 기능을 이용할 수 있습니다.', bullets:['북라운지 방문','북메이트 신청','인사하기'] },
                discussion: { icon:'📚', title:'함께 책 이야기를 나눠요.', desc:'로그인 후 감상, 추천, 질문을 자유롭게 남길 수 있습니다.', bullets:['감상 남기기','추천하기','질문하기'] },
                gathering: { icon:'👥', title:'BOOKMATE가 되어 독서모임을 함께 하세요.', desc:'비슷한 독서취향을 가진 사람들과\n책으로 연결됩니다.', bullets:['독서모임 참여','함께 읽기','모임 기록 저장'] }
            };
            const c = configs[kind] || configs.social;
            const modal = document.getElementById('guest-action-modal');
            if (!modal) { showToast((c.title || '').replace(/\n/g,' ')); return; }
            safeSetText('guest-action-icon', c.icon || '👤');
            safeSetText('guest-action-title', c.title || 'BOOKMATE가 되어 함께 이야기해요.');
            safeSetText('guest-action-desc', c.desc || '로그인 후 더 많은 기능을 이용할 수 있습니다.');
            const list = document.getElementById('guest-action-list');
            if (list) list.innerHTML = (c.bullets || []).map(b => `<li class="flex items-center gap-2"><span class="w-5 h-5 rounded-full bg-brand-sageLight text-brand-sageDark flex items-center justify-center text-[10px]">✓</span><span>${b}</span></li>`).join('');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => { try { lucide.createIcons(); } catch(e) {} }, 0);
        }
        function closeGuestActionModal() {
            const modal = document.getElementById('guest-action-modal');
            if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
        }
        document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeGuestActionModal(); });
        function showGuestJoinPrompt(kind='discussion') {
            const prompts = {
                discussion: { icon:'📚', title:'BOOKMATE가 되어, 함께 책 이야기를 나눠요.', desc:'로그인 후 감상, 추천, 질문을 자유롭게 남길 수 있습니다.' },
                ai: { icon:'🤖', title:'AI 모아와의 대화가 마음에 드셨나요?', desc:'BOOKMATE가 되어 더 많은 대화를 이어가고,\n나만의 독서 기록을 차곡차곡 남겨보세요.' },
                gathering: { icon:'👥', title:'BOOKMATE가 되어 독서모임을 함께 하세요.', desc:'비슷한 독서취향을 가진 사람들과\n책으로 연결됩니다.' },
                lounge: { icon:'🏡', title:'독서 활동으로 나만의 공간을 꾸며보세요.', desc:'BOOKMATE가 되어 아이템을 모으고\n나만의 북라운지를 채워보세요.' },
                archive: { icon:'📖', title:'읽은 책과 생각을 차곡차곡 기록해 보세요.', desc:'BOOKMATE가 되어 독서기록, AI 대화, 감상, 필사를\n나만의 아카이브에 남겨보세요.' },
                bookmates: { icon:'🤝', title:'같은 책을 좋아하는 사람들과 만나보세요.', desc:'BOOKMATE가 되어 독서 친구를 만들고\n책으로 연결되어 보세요.' }
            };
            const p = prompts[kind] || prompts.discussion;
            window.bookmateGuestReturnView = (state.currentView && state.currentView !== 'guest-gate') ? state.currentView : 'home';
            renderGuestGate(p);
            navigate('guest-gate');
        }
        function updateGuestHomeVisibility() {
            const guest = isGuestUser();
            const live = document.getElementById('top-live-meeting-badge');
            if (live) {
                live.classList.toggle('hidden', guest);
                live.setAttribute('aria-hidden', guest ? 'true' : 'false');
            }
            const schedule = document.getElementById('home-reading-schedule-card');
            if (schedule) {
                schedule.classList.toggle('hidden', guest);
                schedule.setAttribute('aria-hidden', guest ? 'true' : 'false');
            }
            updateHomeBrief();
        }
        function renderGuestGate(config) {
            const c = config || {};
            safeSetText('guest-gate-icon', c.icon || '📚');
            safeSetText('guest-gate-title', c.title || 'BOOKMATE가 되어 함께 이야기해요.');
            safeSetText('guest-gate-desc', c.desc || '로그인 후 더 많은 기능을 이용할 수 있습니다.');
        }
        function returnFromGuestGate() {
            const target = window.bookmateGuestReturnView || 'home';
            window.bookmateGuestReturnView = 'home';
            window.bookmateGuestBlurView = '';
            navigate(target === 'guest-gate' ? 'home' : target);
        }
        window.returnFromGuestGate = returnFromGuestGate;
        function openAuthPage(mode='login') { showAuthScreen(mode); }
        function appendGuestAIJoinCard(scroller) {
            if (!scroller || document.getElementById('guest-ai-join-card')) return;
            const cardWrap = document.createElement('div');
            cardWrap.id = 'guest-ai-join-card';
            cardWrap.className = "max-w-[88%] animate-fadeIn mt-4 mb-2 ml-10";
            cardWrap.innerHTML = `
                <div class="bg-white p-5 rounded-2xl border border-brand-sage/30 shadow-sm relative overflow-hidden">
                    <div class="absolute -right-6 -top-6 text-brand-sage/10"><i data-lucide="sparkles" class="w-24 h-24"></i></div>
                    <div class="relative z-10">
                        <h4 class="serif-title text-base font-bold text-brand-navy">AI 모아와의 대화가 마음에 드셨나요?</h4>
                        <p class="text-xs text-gray-500 leading-relaxed mt-2">BOOKMATE가 되어 더 많은 대화를 이어가고,<br>나만의 독서 기록을 차곡차곡 남겨보세요.</p>
                        <div class="flex gap-2 mt-4">
                            <button onclick="openAuthPage('login')" class="px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold">로그인</button>
                            <button onclick="openAuthPage('signup')" class="px-4 py-2 rounded-xl bg-white border border-brand-ivoryDark text-brand-navy text-xs font-bold">회원가입</button>
                        </div>
                    </div>
                </div>`;
            scroller.appendChild(cardWrap);
            lucide.createIcons();
            scroller.scrollTop = scroller.scrollHeight;
        }

        function isCurrentUserAuthor(author) { return !!(state.currentUser && !state.currentUser.isGuest && state.currentUser.nickname === author); }
        function persistSocialState() { try { if (typeof saveAppState === 'function') saveAppState(); } catch(e) {} }
        function renderSocialComposerState() {
            const guest = isGuestUser();
            const notice = document.getElementById('guest-social-notice');
            if (notice) notice.classList.toggle('hidden', !guest);
            ['social-post-text','social-post-book','social-post-scope'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.disabled = guest;
                    el.classList.toggle('opacity-60', guest);
                    el.classList.toggle('cursor-not-allowed', guest);
                    if (guest && id === 'social-post-text') el.placeholder = '회원가입 후 책 이야기를 남길 수 있어요.';
                }
            });
            const submit = document.getElementById('social-post-submit');
            if (submit) {
                submit.disabled = guest;
                submit.classList.toggle('opacity-50', guest);
                submit.classList.toggle('cursor-not-allowed', guest);
                submit.textContent = guest ? '회원 전용' : '올리기';
            }
        }

        function getDiscussionBookMeta(title, author='', cover='', isbn='') {
            const known = (typeof findKnownBook === 'function') ? findKnownBook(title) : null;
            return { title: title || '책 제목 없음', author: author || known?.author || '', isbn: isbn || known?.isbn || '', cover: cover || (typeof getDirectCoverByTitle === 'function' ? getDirectCoverByTitle(title) : '') || known?.fixedCoverUrl || known?.thumbnail || '' };
        }
        function bookCoverFallbackHTML(meta, size='w-20 h-28') { return `<div class="${size} rounded-xl shadow-sm border border-brand-ivoryDark bg-gradient-to-br from-brand-navy to-brand-sage text-white flex items-center justify-center text-[10px] font-bold text-center leading-tight p-2">${String(meta.title||'BOOK').slice(0,8)}</div>`; }
        function bookCoverHTML(meta, size='w-20 h-28') { return meta.cover ? `<img src="${escapeAttr(meta.cover)}" alt="${escapeAttr(meta.title)} 표지" referrerpolicy="no-referrer" class="${size} object-cover rounded-xl shadow-sm border border-brand-ivoryDark bg-brand-ivory">` : bookCoverFallbackHTML(meta, size); }
        function getBookDiscussionStats(title) {
            const key = typeof normalizeTitleKey === 'function' ? normalizeTitleKey(title) : String(title||'');
            const posts = (state.socialPosts||[]).filter(p => (typeof normalizeTitleKey === 'function' ? normalizeTitleKey(p.book||'') : String(p.book||'')) === key);
            return { total: posts.length, 감상: posts.filter(p=>p.category==='감상').length, 추천: posts.filter(p=>p.category==='추천').length, 질문: posts.filter(p=>p.category==='질문').length, 함께: posts.filter(p=>p.category==='함께 읽어요').length, likes: posts.reduce((a,p)=>a+(+p.likes||0),0) };
        }
        function openBookDiscussion(title) { state.bookDiscussionFilter = title; state.socialFilter='전체'; const i=document.getElementById('discussion-global-book-search'); if(i) i.value=title; const r=document.getElementById('discussion-book-search-results'); if(r) r.classList.add('hidden'); renderSocialFeed(); showToast(`『${title}』 이야기만 모아봅니다.`); }
        function clearBookDiscussionFilter() { state.bookDiscussionFilter=''; const i=document.getElementById('discussion-global-book-search'); if(i) i.value=''; renderSocialFeed(); }
        async function searchDiscussionBooks(keyword) {
            const box=document.getElementById('discussion-book-search-results'); if(!box) return; const q=keyword.trim(); if(!q){box.classList.add('hidden'); box.innerHTML=''; return;}
            box.classList.remove('hidden'); box.innerHTML='<div class="p-3 text-xs text-gray-400">책을 찾는 중...</div>'; let books=[]; try{books=await searchGoogleBooks(q);}catch(e){}
            if(!books.length && typeof KNOWN_BOOKS!=='undefined') books=Object.keys(KNOWN_BOOKS).filter(t=>t.includes(q)).map(t=>findKnownBook(t));
            box.innerHTML=(books||[]).slice(0,7).map(b=>{const m=getDiscussionBookMeta(b.title,b.author,b.thumbnail||b.fixedCoverUrl,b.isbn); return `<button onclick="openBookDiscussion('${escapeAttr(m.title)}')" class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-brand-ivory text-left transition-colors">${bookCoverHTML(m,'w-10 h-14')}<span class="min-w-0"><b class="block text-xs text-brand-navy line-clamp-1">${m.title}</b><span class="text-[10px] text-gray-500 line-clamp-1">${m.author||'저자 정보 없음'}</span></span></button>`;}).join('') || '<div class="p-3 text-xs text-gray-400">검색 결과가 없습니다.</div>';
        }
        async function searchSocialPostBooks(keyword) {
            const box=document.getElementById('social-post-book-results'); if(!box) return; const q=keyword.trim(); ['author','cover','isbn'].forEach(k=>{const el=document.getElementById(`social-post-book-${k}`); if(el) el.value='';}); if(!q){box.classList.add('hidden'); return;}
            box.classList.remove('hidden'); box.innerHTML='<div class="p-2 text-[10px] text-gray-400">검색 중...</div>'; let books=[]; try{books=await searchGoogleBooks(q);}catch(e){}
            if(!books.length && typeof KNOWN_BOOKS!=='undefined') books=Object.keys(KNOWN_BOOKS).filter(t=>t.includes(q)).map(t=>findKnownBook(t));
            box.innerHTML=(books||[]).slice(0,6).map(b=>{const m=getDiscussionBookMeta(b.title,b.author,b.thumbnail||b.fixedCoverUrl,b.isbn); return `<button onclick="selectSocialPostBook('${escapeAttr(m.title)}','${escapeAttr(m.author)}','${escapeAttr(m.cover)}','${escapeAttr(m.isbn)}')" class="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-brand-ivory text-left">${bookCoverHTML(m,'w-8 h-11')}<span class="min-w-0"><b class="block text-[11px] text-brand-navy line-clamp-1">${m.title}</b><span class="text-[9px] text-gray-500 line-clamp-1">${m.author||'저자 정보 없음'}</span></span></button>`;}).join('') || '<div class="p-2 text-[10px] text-gray-400">검색 결과가 없습니다.</div>';
        }
        function selectSocialPostBook(title, author, cover, isbn) { document.getElementById('social-post-book').value=title; document.getElementById('social-post-book-author').value=author||''; document.getElementById('social-post-book-cover').value=cover||''; document.getElementById('social-post-book-isbn').value=isbn||''; const b=document.getElementById('social-post-book-results'); if(b)b.classList.add('hidden'); showToast(`『${title}』이 연결되었습니다.`); }
        function triggerSocialPostBookSearch(){ const input=document.getElementById('social-post-book'); const q=(input?.value||'').trim(); if(!q){ showToast('검색할 책 제목을 입력해주세요.'); input?.focus(); return; } searchSocialPostBooks(q); }
        function openMemberActionMenu(author,id){
            document.querySelectorAll('.member-action-menu').forEach(el=>el.classList.add('hidden'));
            if(isGuestUser()){
                showGuestActionModal('social');
                return;
            }
            const m=document.getElementById(`member-menu-${id}`); if(m)m.classList.toggle('hidden');
        }
        function findAccountByNickname(nickname){ const users=(typeof getAuthUsers==='function')?getAuthUsers():(typeof DEFAULT_AUTH_USERS!=='undefined'?DEFAULT_AUTH_USERS:[]); return users.find(u=>u.nickname===nickname || u.id===nickname); }
        function normalizeLibraryName(name){ return String(name||'').replace(/\s+/g,'').replace('없음','소속도서관없음'); }
        function getAuthorLibrary(author){ const account=findAccountByNickname(author); return account?.library || ''; }
        function getAuthorLibraryVerified(author){ const account=findAccountByNickname(author); return !!account?.libraryVerified; }
        function getPostLibrary(post){ return post?.library || getAuthorLibrary(post?.author) || ''; }
        function isNoLibrary(name){ const n=normalizeLibraryName(name); return !n || n.includes('소속도서관없음'); }
        function isSameLibrary(a,b){ return !!a && !!b && !isNoLibrary(a) && !isNoLibrary(b) && normalizeLibraryName(a)===normalizeLibraryName(b); }
        function libraryBadgeHTML(author, post){ const library=getPostLibrary(post||{author}); if(!library || isNoLibrary(library)) return ''; const verified=getAuthorLibraryVerified(author); const short=library.replace('도서관','').replace('시립','시립'); return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-sageLight text-brand-sageDark text-[9px] font-bold border border-brand-sage/20">🏛 ${escapeAttr(short)}${verified?' 인증':''}</span>`; }
        function visitMemberLounge(author){ if(isGuestUser()){ showGuestJoinPrompt('lounge'); return; } const account=findAccountByNickname(author); window.bookmateVisitedLoungeAuthor = account ? account.nickname : author; navigate('booklounge'); renderOfficialLounge(); showToast(`${window.bookmateVisitedLoungeAuthor}님의 북라운지로 이동했습니다.`); }
        function memberQuickAction(action,author){ if(action==='북라운지 방문'){ visitMemberLounge(author); return; } showToast(`${author}님에게 '${action}' 기능을 실행했습니다.`);}
        function renderDiscussionWidgets(){renderRecommendationRanking(); renderHotDiscussionBook(); renderDiscussionTags();}
        function renderHotDiscussionBook(){const c=document.getElementById('hot-discussion-book-card'); if(!c)return; const books={}; (state.socialPosts||[]).forEach(p=>{if(p.book)books[p.book]=(books[p.book]||0)+1+(p.comments?.length||0)}); const ent=Object.entries(books).sort((a,b)=>b[1]-a[1])[0]; if(!ent){c.innerHTML='<div class="text-xs text-gray-400">아직 이야기되는 책이 없습니다.</div>';return;} const title=ent[0], m=getDiscussionBookMeta(title), st=getBookDiscussionStats(title); c.innerHTML=`<span class="text-xs font-bold text-brand-navy tracking-wider uppercase block border-b border-brand-ivory pb-2 flex items-center gap-1.5"><i data-lucide="flame" class="w-4 h-4 text-orange-500"></i> 오늘 가장 많이 이야기되는 책</span><button onclick="openBookDiscussion('${escapeAttr(title)}')" class="w-full text-left mt-4 group"><div class="flex gap-3 items-center">${bookCoverHTML(m,'w-16 h-24')}<div class="min-w-0"><h4 class="serif-title font-bold text-brand-navy line-clamp-2 group-hover:text-brand-sage">${title}</h4><p class="text-[10px] text-gray-500 mt-1">${m.author||'저자 정보 없음'}</p><div class="flex gap-1.5 mt-2 flex-wrap text-[10px] font-bold"><span class="bg-brand-sageLight text-brand-sageDark px-2 py-0.5 rounded-full">💬 ${st.total}</span><span class="bg-brand-ivory text-brand-navy px-2 py-0.5 rounded-full">👍 ${st.likes}</span></div></div></div></button>`; lucide.createIcons();}
        function renderDiscussionTags(){const c=document.getElementById('discussion-tag-list'); if(!c)return; const tags=['#소설','#감상','#추천','#질문','#채식주의자','#달러구트','#사피엔스','#독서모임']; c.innerHTML=tags.map(t=>`<button onclick="filterSocialFeed('${t.replace('#','')}')" class="px-3 py-1.5 rounded-full bg-brand-ivory hover:bg-brand-sageLight text-[10px] font-bold text-brand-navy transition-colors">${t}</button>`).join('');}

        function publishSocialPost() {
            if (isGuestUser()) { showGuestJoinPrompt('discussion'); return; }
            const text = document.getElementById('social-post-text').value.trim();
            if(!text) { showToast("내용을 입력해주세요", "error"); return; }
            const selectedScope = document.getElementById('social-post-scope')?.value || '전체';
            if (selectedScope === '내 도서관' && isNoLibrary(state.currentUser?.library)) { showToast('소속도서관 인증 후 내 도서관 글을 남길 수 있어요.'); return; }
            state.socialPosts.unshift({
                id: Date.now(),
                author: state.currentUser.nickname,
                authorInitial: state.currentUser.nickname.charAt(0),
                time: "방금",
                category: state.activeSocialCategory,
                book: document.getElementById('social-post-book').value.trim(),
                bookAuthor: document.getElementById('social-post-book-author')?.value || '',
                bookCover: document.getElementById('social-post-book-cover')?.value || '',
                bookIsbn: document.getElementById('social-post-book-isbn')?.value || '',
                scope: selectedScope,
                visibility: selectedScope === '내 도서관' ? 'library' : 'public',
                library: state.currentUser.library || '',
                text: text,
                likes: 0,
                liked: false,
                showComments: false,
                comments: []
            });
            renderSocialFeed();
            renderDiscussionWidgets();
            document.getElementById('social-post-text').value = '';
            document.getElementById('social-post-book').value = '';
            document.getElementById('social-post-book-author').value = '';
            document.getElementById('social-post-book-cover').value = '';
            document.getElementById('social-post-book-isbn').value = '';
            const scopeEl = document.getElementById('social-post-scope'); if(scopeEl) scopeEl.value = '전체';
        }

        function setSocialCategory(cat) { state.activeSocialCategory = cat; document.querySelectorAll('.cat-chip').forEach(b=>{b.classList.remove('bg-brand-navy','text-white'); b.classList.add('bg-brand-ivory','text-brand-navy');}); const a=document.getElementById(`chip-cat-${cat}`); if(a){a.classList.add('bg-brand-navy','text-white'); a.classList.remove('bg-brand-ivory','text-brand-navy');} }
        function filterSocialFeed(cat) { state.socialFilter = cat; renderSocialFeed(); }
        
        function renderSocialFeed() {
            const container = document.getElementById('social-feed-container');
            if (!container) return;
            container.innerHTML = '';
            let list = [...(state.socialPosts || [])];
            if (state.bookDiscussionFilter) {
                const filterKey = (typeof normalizeTitleKey === 'function') ? normalizeTitleKey(state.bookDiscussionFilter) : state.bookDiscussionFilter;
                list = list.filter(p => ((typeof normalizeTitleKey === 'function') ? normalizeTitleKey(p.book || '') : (p.book || '')) === filterKey);
            }
            // 도서관 전용 글은 같은 소속도서관 회원에게만 보입니다. 게스트는 전체 공개 글만 볼 수 있습니다.
            list = list.filter(p => {
                if ((p.visibility === 'library' || p.scope === '내 도서관') && !isSameLibrary(getPostLibrary(p), state.currentUser?.library)) return false;
                return true;
            });
            if (state.socialFilter && !['전체','최신','인기'].includes(state.socialFilter)) {
                if (['감상','추천','질문','함께 읽어요'].includes(state.socialFilter)) list = list.filter(p => p.category === state.socialFilter);
                else if (state.socialFilter === '내 도서관') {
                    if (isGuestUser() || isNoLibrary(state.currentUser?.library)) { showGuestJoinPrompt('discussion'); return; }
                    list = list.filter(p => isSameLibrary(getPostLibrary(p), state.currentUser.library));
                }
                else list = list.filter(p => (p.book || '').includes(state.socialFilter) || (p.text || '').includes(state.socialFilter));
            }
            if (state.socialFilter === '인기') list.sort((a,b)=>(b.likes||0)-(a.likes||0));
            if (state.socialFilter === '최신') list.sort((a,b)=>(b.id||0)-(a.id||0));
            renderDiscussionWidgets();
            if (list.length === 0) { container.innerHTML = `<div class="p-8 text-center text-gray-400 text-xs bg-white rounded-xl border border-brand-ivoryDark">${state.bookDiscussionFilter ? '『'+state.bookDiscussionFilter+'』에 대한 이야기가 아직 없습니다.' : '게시글이 없습니다. 첫 글의 주인공이 되어보세요!'}</div>`; return; }
            if (state.bookDiscussionFilter) {
                const m=getDiscussionBookMeta(state.bookDiscussionFilter), st=getBookDiscussionStats(state.bookDiscussionFilter); const sum=document.createElement('div'); sum.className='relative bg-gradient-to-br from-brand-sageLight to-white p-5 pr-20 rounded-2xl border border-brand-sage/30 shadow-sm'; sum.innerHTML=`<div class="flex items-start justify-between gap-4 mb-4"><div><p class="text-[10px] font-bold text-brand-sageDark tracking-wider uppercase">이 책의 이야기</p><h3 class="serif-title text-xl md:text-2xl font-bold text-brand-navy leading-tight break-keep mt-1">${m.title}</h3></div><button onclick="clearBookDiscussionFilter()" class="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-brand-navy text-white hover:bg-brand-navyLight transition-colors shadow-sm text-[11px] font-bold whitespace-nowrap" title="전체보기로 돌아가기"><i data-lucide="x" class="w-4 h-4"></i> 전체보기</button></div><div class="flex gap-4 items-center">${bookCoverHTML(m,'w-20 h-28 shrink-0')}<div class="min-w-0 flex-1"><p class="text-xs text-gray-500">${m.author||'저자 정보 없음'}</p><div class="flex flex-wrap gap-2 mt-3 text-[10px] font-bold"><span class="bg-white text-brand-navy px-2.5 py-1 rounded-full border border-brand-ivoryDark">💬 전체 ${st.total}</span><span class="bg-white text-brand-sageDark px-2.5 py-1 rounded-full border border-brand-ivoryDark">📖 감상 ${st.감상}</span><span class="bg-white text-amber-700 px-2.5 py-1 rounded-full border border-brand-ivoryDark">💡 추천 ${st.추천}</span><span class="bg-white text-blue-600 px-2.5 py-1 rounded-full border border-brand-ivoryDark">❓ 질문 ${st.질문}</span><span class="bg-white text-purple-700 px-2.5 py-1 rounded-full border border-brand-ivoryDark">👥 함께 ${st.함께||0}</span></div></div></div>`; container.appendChild(sum);
            }
            list.forEach(p => {
                const commentCount = p.comments.length + p.comments.reduce((acc,c)=>acc+(c.replies?c.replies.length:0),0);
                const m=getDiscussionBookMeta(p.book,p.bookAuthor,p.bookCover,p.bookIsbn), st=p.book?getBookDiscussionStats(p.book):{total:0,likes:0};
                const commentsHTML = p.showComments ? `<div class="mt-4 pt-4 border-t border-brand-ivoryDark bg-brand-ivory/30 -mx-6 px-6 pb-2 rounded-b-2xl animate-fadeIn">${p.comments.map(c=>{ const canEditComment=isCurrentUserAuthor(c.author); return `<div class="flex gap-2 mt-4">${getAvatarByName(c.author,'w-7 h-7')}<div class="flex-grow"><div class="bg-white p-3 rounded-xl rounded-tl-none border border-brand-ivoryDark shadow-sm"><div class="flex justify-between items-start mb-1"><span class="font-bold text-xs text-brand-navy">${c.author} <span class="font-normal text-gray-400 ml-1 text-[10px]">${c.time}</span></span>${canEditComment?`<span class="flex gap-1"><button onclick="editSocialComment(${p.id}, ${c.id})" class="text-[10px] font-bold text-gray-400 hover:text-brand-sage">수정</button><button onclick="deleteSocialComment(${p.id}, ${c.id})" class="text-[10px] font-bold text-gray-400 hover:text-red-500">삭제</button></span>`:''}</div><p class="text-xs text-brand-navy">${c.text}</p></div><div class="flex gap-3 mt-1.5 ml-1"><button onclick="likeSocialItem('comment', ${p.id}, ${c.id})" class="text-[10px] font-semibold flex items-center gap-1 ${c.liked?'text-red-500':'text-gray-400 hover:text-brand-sage'}"><i data-lucide="heart" class="w-3 h-3 ${c.liked?'fill-red-500':''}"></i> ${c.likes}</button></div></div></div>`;}).join('')}${isGuestUser()?guestAuthCardHTML('BOOKMATE가 되어, 함께 책 이야기를 나눠요.','로그인 후 감상, 추천, 질문을 자유롭게 남길 수 있습니다.','📚'):`<div class="mt-4 flex gap-2 items-center pb-2">${getAvatarHTML(state.currentUser,'w-8 h-8')}<input id="comment-input-${p.id}" type="text" placeholder="이 이야기에 댓글을 남겨보세요..." class="flex-1 bg-white border border-brand-ivoryDark rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-sage" onkeypress="if(event.key === 'Enter') addSocialComment(${p.id})"><button onclick="addSocialComment(${p.id})" class="bg-brand-navy hover:bg-brand-navyLight text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm">등록</button></div>`}</div>` : '';
                let catColor='bg-[#FAF1D6] text-amber-800', icon='💡'; if(p.category==='감상'){catColor='bg-[#EAF2E8] text-brand-sageDark'; icon='📖';} if(p.category==='질문'){catColor='bg-blue-50 text-blue-600'; icon='❓';} if(p.category==='함께 읽어요'){catColor='bg-purple-50 text-purple-700'; icon='👥';}
                const ownerActions = isCurrentUserAuthor(p.author) ? `<div class="flex items-center gap-1 mr-2"><button onclick="editSocialPost(${p.id})" class="px-2 py-1 rounded-lg bg-brand-ivory text-[10px] font-bold text-brand-navy hover:bg-brand-sageLight">수정</button><button onclick="deleteSocialPost(${p.id})" class="px-2 py-1 rounded-lg bg-red-50 text-[10px] font-bold text-red-500 hover:bg-red-100">삭제</button></div>` : '';
                const div=document.createElement('div'); div.className='bg-white p-6 rounded-2xl border border-brand-ivoryDark shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all';
                div.innerHTML=`${p.book?`<button onclick="openBookDiscussion('${escapeAttr(p.book)}')" class="w-full text-left mb-5 group"><div class="flex gap-4 bg-brand-ivory/40 border border-brand-ivoryDark rounded-2xl p-3 hover:border-brand-sage/40 transition-colors">${bookCoverHTML(m,'w-20 h-28')}<div class="min-w-0 flex-1 py-1"><p class="text-[9px] font-bold text-brand-sageDark tracking-wider uppercase">BOOK DISCUSSION</p><h3 class="serif-title text-lg font-bold text-brand-navy line-clamp-2 group-hover:text-brand-sage">${m.title}</h3><p class="text-[11px] text-gray-500 mt-1">${m.author||'저자 정보 없음'}</p><div class="flex gap-1.5 flex-wrap mt-3 text-[10px] font-bold"><span class="bg-white border border-brand-ivoryDark text-brand-navy px-2 py-0.5 rounded-full">💬 이야기 ${st.total}</span><span class="bg-white border border-brand-ivoryDark text-brand-sageDark px-2 py-0.5 rounded-full">👍 관심 ${st.likes}</span></div></div></div></button>`:''}<div class="flex justify-between items-start mb-3 relative"><button onclick="openMemberActionMenu('${escapeAttr(p.author)}', ${p.id})" class="flex items-center gap-2.5 text-left group">${getAvatarByName(p.author,'w-9 h-9')}<div><h4 class="font-bold text-xs text-brand-navy group-hover:text-brand-sage flex items-center gap-1.5 flex-wrap"><span>${p.author}</span> <span class="text-[9px] text-gray-400 font-normal">${p.time}</span> ${libraryBadgeHTML(p.author,p)} ${(p.scope==='내 도서관'||p.visibility==='library')?'<span class="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-ivory text-brand-navy text-[9px] font-bold border border-brand-ivoryDark">우리 도서관 공개</span>':''}</h4><p class="text-[10px] text-gray-400">닉네임을 누르면 메뉴가 열립니다</p></div></button><div id="member-menu-${p.id}" class="member-action-menu hidden absolute left-0 top-11 bg-white border border-brand-ivoryDark rounded-xl shadow-xl p-1.5 z-30 w-40 text-[11px] font-bold"><button onclick="memberQuickAction('북라운지 방문','${escapeAttr(p.author)}')" class="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-ivory">🏠 북라운지 방문</button><button onclick="memberQuickAction('인사하기','${escapeAttr(p.author)}')" class="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-ivory">👋 인사하기</button><button onclick="memberQuickAction('북메이트 신청','${escapeAttr(p.author)}')" class="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-ivory">🤝 북메이트 신청</button></div><div class="flex items-center gap-1">${ownerActions}<span class="${catColor} text-[10px] px-2.5 py-1 rounded-full font-bold">${icon} ${p.category}</span></div></div><div class="text-sm text-gray-700 leading-relaxed mb-4">${p.text}</div><div class="flex gap-4 text-xs border-t border-brand-ivory pt-3 mt-2"><button onclick="likeSocialItem('post', ${p.id})" class="flex items-center gap-1.5 font-semibold transition-colors ${p.liked?'text-red-500':'text-gray-400 hover:text-brand-navy'}"><i data-lucide="heart" class="w-4 h-4 ${p.liked?'fill-red-500':''}"></i> 좋아요 ${p.likes}</button><button onclick="toggleSocialComments(${p.id})" class="flex items-center gap-1.5 font-semibold text-gray-400 hover:text-brand-navy transition-colors"><i data-lucide="message-circle" class="w-4 h-4"></i> 댓글 ${commentCount}</button></div>${commentsHTML}`;
                container.appendChild(div);
            });
            lucide.createIcons();
        }

        function editSocialPost(postId) {
            const p = state.socialPosts.find(x => x.id === postId);
            if (!p || !isCurrentUserAuthor(p.author)) return;
            const next = prompt('게시글 내용을 수정하세요.', p.text || '');
            if (next === null) return;
            const clean = next.trim();
            if (!clean) { showToast('게시글 내용은 비워둘 수 없습니다.'); return; }
            p.text = clean;
            p.time = '수정됨';
            persistSocialState();
            renderSocialFeed();
            showToast('게시글을 수정했습니다.');
        }

        function deleteSocialPost(postId) {
            const idx = state.socialPosts.findIndex(x => x.id === postId);
            if (idx < 0 || !isCurrentUserAuthor(state.socialPosts[idx].author)) return;
            if (!confirm('이 게시글을 삭제할까요?')) return;
            state.socialPosts.splice(idx, 1);
            persistSocialState();
            renderSocialFeed();
            showToast('게시글을 삭제했습니다.');
        }

        function editSocialComment(postId, commentId) {
            const p = state.socialPosts.find(x => x.id === postId);
            const c = p && p.comments.find(x => x.id === commentId);
            if (!c || !isCurrentUserAuthor(c.author)) return;
            const next = prompt('댓글 내용을 수정하세요.', c.text || '');
            if (next === null) return;
            const clean = next.trim();
            if (!clean) { showToast('댓글 내용은 비워둘 수 없습니다.'); return; }
            c.text = clean;
            c.time = '수정됨';
            persistSocialState();
            renderSocialFeed();
            showToast('댓글을 수정했습니다.');
        }

        function deleteSocialComment(postId, commentId) {
            const p = state.socialPosts.find(x => x.id === postId);
            if (!p) return;
            const idx = p.comments.findIndex(x => x.id === commentId);
            if (idx < 0 || !isCurrentUserAuthor(p.comments[idx].author)) return;
            if (!confirm('이 댓글을 삭제할까요?')) return;
            p.comments.splice(idx, 1);
            persistSocialState();
            renderSocialFeed();
            showToast('댓글을 삭제했습니다.');
        }

        function likeSocialItem(type, postId, commentId = null, replyId = null) {
            if (isGuestUser()) { showGuestJoinPrompt('discussion'); return; }
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
            persistSocialState();
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
            if (isGuestUser()) { showGuestJoinPrompt('discussion'); return; }
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
                persistSocialState();
                renderSocialFeed();
            }
        }

        function addSocialReply(postId, commentId) {
            if (isGuestUser()) { showGuestJoinPrompt('discussion'); return; }
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
                    persistSocialState();
                    renderSocialFeed();
                }
            }
        }

        function renderRecommendationRanking() {
            const counts = {};
            (state.socialPosts || []).forEach(p => { if (p.category === '추천' && p.book) { if(!counts[p.book]) counts[p.book]={count:0,likes:0,author:p.bookAuthor||'',cover:p.bookCover||'',isbn:p.bookIsbn||''}; counts[p.book].count++; counts[p.book].likes += Number(p.likes||0); }});
            const sorted = Object.entries(counts).sort((a,b)=>(b[1].count+b[1].likes/10)-(a[1].count+a[1].likes/10)).slice(0,10);
            const container=document.getElementById('realtime-recommendation-list'); if(!container)return; container.innerHTML='';
            if(!sorted.length){ container.innerHTML='<div class="text-xs text-gray-400 py-2">아직 추천된 도서가 없습니다. 첫 추천글을 남겨보세요!</div>'; return; }
            sorted.forEach(([title,data],idx)=>{const m=getDiscussionBookMeta(title,data.author,data.cover,data.isbn); container.innerHTML += `<button class="w-full flex items-center gap-3 text-xs group cursor-pointer bg-brand-ivory/30 p-2.5 rounded-xl border border-transparent hover:border-brand-sage/30 hover:bg-brand-sageLight/20 transition-all text-left" onclick="openBookDiscussion('${escapeAttr(title)}')"><span class="w-5 text-center ${idx<3?'text-brand-sage':'text-gray-400'} font-serif font-bold text-lg">${idx+1}</span>${bookCoverHTML(m,'w-10 h-14')}<span class="min-w-0 flex-1"><b class="block text-brand-navy group-hover:text-brand-sage line-clamp-2">${title}</b><span class="block text-[10px] text-gray-500 mt-0.5">${data.count}회 추천 · 좋아요 ${data.likes}</span></span></button>`;});
            lucide.createIcons();
        }


        // BOOKMATE v2.0: 로컬 로그인 / 회원가입 시스템
        const AUTH_USERS_KEY = 'bookmate_v2_auth_users';
        const AUTH_SESSION_KEY = 'bookmate_v2_auth_session';

        const DEFAULT_AUTH_USERS = [
            { id: 'moa01', password: '1234', name: '김도윤', age: 29, gender: '남성', nickname: '달빛독서가', library: '익산시립도서관', libraryVerified: true, tastes: ['소설','에세이','인문'], readingType: '감성 탐험가', readingTypeIcon: '🌿', avatarId: 1, role: '대표 계정 · 따뜻한 감상글', readBooksCount: 68, gatheringCount: 3, chatMessagesCount: 1540 },
            { id: 'moa02', password: '1234', name: '이서윤', age: 34, gender: '여성', nickname: '사유올빼미', library: '전북대표도서관', libraryVerified: true, tastes: ['철학','심리','인문'], readingType: '깊은 사색가', readingTypeIcon: '🧠', avatarId: 2, role: '긴 감상글 · 깊은 댓글', readBooksCount: 91, gatheringCount: 2, chatMessagesCount: 2120 },
            { id: 'moa03', password: '1234', name: '박민준', age: 26, gender: '남성', nickname: '책읽는고양이', library: '소속도서관 없음', libraryVerified: true, tastes: ['판타지','SF','추리'], readingType: '상상 설계자', readingTypeIcon: '🚀', avatarId: 3, role: '신간 추천 · 장르 독서', readBooksCount: 52, gatheringCount: 1, chatMessagesCount: 820 },
            { id: 'moa04', password: '1234', name: '최유진', age: 31, gender: '여성', nickname: '지혜의등대', library: '서울시립도서관', libraryVerified: true, tastes: ['사회','경제','자기계발'], readingType: '성장 전략가', readingTypeIcon: '💼', avatarId: 4, role: '질문글 · 토론 리더', readBooksCount: 74, gatheringCount: 4, chatMessagesCount: 1760 },
            { id: 'moa05', password: '1234', name: '정현우', age: 42, gender: '남성', nickname: '초록책갈피', library: '국립도서관', libraryVerified: true, tastes: ['역사','인문','예술'], readingType: '인문 산책가', readingTypeIcon: '🏛', avatarId: 1, role: '독서모임 운영자', readBooksCount: 116, gatheringCount: 5, chatMessagesCount: 2410 },
            { id: 'moa06', password: '1234', name: '김하은', age: 28, gender: '여성', nickname: '문장수집가', library: '익산시립도서관', libraryVerified: true, tastes: ['시','에세이','문학'], readingType: '문장 수집가', readingTypeIcon: '✍', avatarId: 2, role: '필사 · 문장 공유', readBooksCount: 63, gatheringCount: 2, chatMessagesCount: 1340 },
            { id: 'moa07', password: '1234', name: '오지훈', age: 38, gender: '남성', nickname: '밤의독서가', library: '익산시립도서관', libraryVerified: true, tastes: ['역사','과학','논픽션'], readingType: '지식 연구자', readingTypeIcon: '🔬', avatarId: 4, role: '새벽 댓글 · 북라운지 고수', readBooksCount: 87, gatheringCount: 3, chatMessagesCount: 980 },
            { id: 'moa08', password: '1234', name: '윤서진', age: 33, gender: '여성', nickname: '활자유목민', library: '전북대표도서관', libraryVerified: true, tastes: ['고전','여행','문학'], readingType: '호기심 여행자', readingTypeIcon: '🌍', avatarId: 3, role: '고전 산책 · 낯선 책 발견', readBooksCount: 59, gatheringCount: 2, chatMessagesCount: 1120 }
        ];


        const BASE_ACCOUNT_DATA = JSON.parse(JSON.stringify({
            recentBooks: state.recentBooks || [],
            recentArchives: state.recentArchives || [],
            gatherings: state.gatherings || [],
            notifications: state.notifications || [],
            socialPosts: state.socialPosts || [],
            aiChatHistory: state.aiChatHistory || [],
            currentAIBook: state.currentAIBook || '',
            currentAIMode: state.currentAIMode || 'debate'
        }));

        function isSeedAccount(userOrId) {
            const id = typeof userOrId === 'string' ? userOrId : (userOrId && userOrId.id);
            return DEFAULT_AUTH_USERS.some(u => u.id === id);
        }

        function getEmptyGatheringsForNewUser() {
            return (BASE_ACCOUNT_DATA.gatherings || []).map(g => ({ ...g, joined: false, isLeader: false }));
        }

        function applyActivityDataForAccount(user) {
            const isBlank = !user || user.isGuest || !isSeedAccount(user.id);
            if (isBlank) {
                state.recentBooks = [];
                state.recentArchives = [];
                state.notifications = [];
                state.socialPosts = JSON.parse(JSON.stringify(BASE_ACCOUNT_DATA.socialPosts || []));
                state.aiChatHistory = [];
                state.aiChatTurns = 0;
                state.currentAIBook = '';
                state.currentAIMode = 'debate';
                state.gatherings = getEmptyGatheringsForNewUser();
                if (typeof loungeBookmates !== 'undefined') loungeBookmates = [];
                return;
            }
            state.recentBooks = JSON.parse(JSON.stringify(BASE_ACCOUNT_DATA.recentBooks || []));
            state.recentArchives = JSON.parse(JSON.stringify(BASE_ACCOUNT_DATA.recentArchives || []));
            state.gatherings = JSON.parse(JSON.stringify(BASE_ACCOUNT_DATA.gatherings || []));
            state.notifications = JSON.parse(JSON.stringify(BASE_ACCOUNT_DATA.notifications || []));
            state.socialPosts = JSON.parse(JSON.stringify(BASE_ACCOUNT_DATA.socialPosts || []));
            state.aiChatHistory = [];
            state.aiChatTurns = 0;
            state.currentAIBook = BASE_ACCOUNT_DATA.currentAIBook || '';
            state.currentAIMode = normalizeAIModeKey(BASE_ACCOUNT_DATA.currentAIMode || 'debate');
            if (typeof loungeBookmates !== 'undefined') loungeBookmates = DEFAULT_BOOKMATES.slice();
        }

        function refreshAccountBoundViews() {
            updateUIProfileData();
            renderMyPageRecentBooks();
            renderReadingTimeline();
            renderMyPageRecentArchives();
            renderSocialFeed();
            renderDiscussionWidgets();
            renderGatheringsGrid();
            renderMyPageGatherings();
            renderBookmates();
            if (typeof renderOfficialLounge === 'function') renderOfficialLounge();
            if (typeof resetAIChat === 'function') resetAIChat();
        }

        function getAuthUsers() {
            try {
                const raw = localStorage.getItem(AUTH_USERS_KEY);
                const saved = raw ? JSON.parse(raw) : [];
                const customUsers = Array.isArray(saved) ? saved.filter(u => !DEFAULT_AUTH_USERS.some(d => d.id === u.id)) : [];
                return DEFAULT_AUTH_USERS.concat(customUsers);
            } catch(e) {
                return DEFAULT_AUTH_USERS.slice();
            }
        }

        function saveAuthUsers(users) {
            const customUsers = (users || []).filter(u => !DEFAULT_AUTH_USERS.some(d => d.id === u.id));
            localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(customUsers));
        }

        function authUserToCurrentUser(user) {
            return {
                id: user.id,
                name: user.name,
                age: user.age,
                gender: user.gender,
                nickname: user.nickname,
                library: user.library,
                libraryVerified: !!user.libraryVerified,
                tastes: user.tastes || [],
                readingType: user.readingType || '',
                readingTypeIcon: user.readingTypeIcon || '',
                avatarType: user.avatarType || 'moa',
                avatarId: user.avatarId || 1,
                avatarImage: user.avatarImage || '',
                readBooksCount: user.readBooksCount ?? 0,
                gatheringCount: user.gatheringCount ?? 0,
                chatMessagesCount: user.chatMessagesCount ?? 0
            };
        }

        function applyLoggedInUser(user) {
            state.currentUser = authUserToCurrentUser(user);
            applyActivityDataForAccount(state.currentUser);
            try { localStorage.setItem(AUTH_SESSION_KEY, user.id); } catch(e) {}
            saveAppState();
            refreshAccountBoundViews();
            renderDemoAccounts();
            hideAuthScreen();
            updateAuthHeader();
            updateGuestHomeVisibility();
            showToast(`${user.nickname}님, 환영합니다!`);
        }

        function initAuthSystem() {
            renderDemoAccounts();
            // BOOKMATE 2.0: 첫 접속은 항상 게스트 상태로 시작합니다.
            // 이전 세션이 남아 있어도 자동 로그인하지 않고, 사용자가 직접 로그인해야 합니다.
            try { localStorage.removeItem(AUTH_SESSION_KEY); } catch(e) {}
            state.currentUser = createGuestUser();
            applyActivityDataForAccount(state.currentUser);
            saveAppState();
            hideAuthScreen();
            updateAuthHeader();
            updateGuestHomeVisibility();
        }

        function showAuthScreen(mode = 'login') {
            switchAuthMode(mode);
            const el = document.getElementById('auth-screen');
            if (el) el.classList.remove('hidden');
            setTimeout(() => { try { lucide.createIcons(); } catch(e) {} }, 0);
        }

        function hideAuthScreen() {
            const el = document.getElementById('auth-screen');
            if (el) el.classList.add('hidden');
        }

        function createGuestUser() {
            return {
                id: 'guest', name: '게스트', age: '', gender: '선택 안 함', nickname: '게스트 독자',
                library: '소속도서관 없음', libraryVerified: false, tastes: ['소설','에세이'],
                readingType: '둘러보는 독자', readingTypeIcon: '👀', avatarType: 'moa', avatarId: 1, avatarImage: '',
                readBooksCount: 0, gatheringCount: 0, chatMessagesCount: 0, isGuest: true
            };
        }

        function updateAuthHeader() {
            const isLoggedIn = !!localStorage.getItem(AUTH_SESSION_KEY);
            const btn = document.getElementById('auth-header-action');
            if (!btn) return;
            btn.title = isLoggedIn ? '로그아웃' : '로그인';
            btn.innerHTML = isLoggedIn ? '<i data-lucide="log-out" class="w-5 h-5"></i>' : '<i data-lucide="log-in" class="w-5 h-5"></i>';
            try { lucide.createIcons(); } catch(e) {}
        }

        function handleAuthHeaderClick() {
            if (localStorage.getItem(AUTH_SESSION_KEY)) logoutBookmate();
            else showAuthScreen('login');
        }

        function continueAsGuest() {
            localStorage.removeItem(AUTH_SESSION_KEY);
            state.currentUser = createGuestUser();
            applyActivityDataForAccount(state.currentUser);
            saveAppState();
            refreshAccountBoundViews();
            hideAuthScreen();
            updateAuthHeader();
            updateGuestHomeVisibility();
            showToast('게스트로 BOOKMATE를 둘러봅니다.');
        }

        function renderDemoAccounts() {
            const list = document.getElementById('demo-account-list');
            if (!list) return;
            const users = getAuthUsers();
            list.innerHTML = users.map(u => `
                <button type="button" onclick="fillDemoAccount('${u.id}', '${(u.password || '').replace(/'/g, "\'")}')" class="text-left rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 transition-colors">
                    <b class="block text-white">${u.id}</b>
                    <span class="block text-white/70 truncate">${u.nickname}</span>
                    <span class="block text-white/40 text-[10px] truncate">${u.readingTypeIcon || ''} ${u.readingType || u.role || '신규 회원'}</span>
                </button>
            `).join('');
        }

        function fillDemoAccount(id, password = '1234') {
            switchAuthMode('login');
            const idEl = document.getElementById('login-id');
            const pwEl = document.getElementById('login-password');
            if (idEl) idEl.value = id;
            if (pwEl) pwEl.value = password || '1234';
        }

        function switchAuthMode(mode) {
            const isLogin = mode === 'login';
            document.getElementById('auth-login-form')?.classList.toggle('hidden', !isLogin);
            document.getElementById('auth-signup-form')?.classList.toggle('hidden', isLogin);
            const loginTab = document.getElementById('auth-login-tab');
            const signupTab = document.getElementById('auth-signup-tab');
            if (loginTab) loginTab.className = `flex-1 py-3 rounded-xl text-sm font-bold ${isLogin ? 'bg-white shadow text-brand-navy' : 'text-gray-500'}`;
            if (signupTab) signupTab.className = `flex-1 py-3 rounded-xl text-sm font-bold ${!isLogin ? 'bg-white shadow text-brand-navy' : 'text-gray-500'}`;
        }

        function handleLoginSubmit(event) {
            event.preventDefault();
            const id = document.getElementById('login-id')?.value.trim();
            const password = document.getElementById('login-password')?.value;
            const user = getAuthUsers().find(u => u.id === id && u.password === password);
            if (!user) { showToast('아이디 또는 비밀번호가 맞지 않습니다.', 'error'); return; }
            applyLoggedInUser(user);
            setTimeout(() => showFirstMissionModal(), 300);
        }

        function resetSignupLibraryVerification() {
            const el = document.getElementById('signup-library-verified');
            const library = document.getElementById('signup-library')?.value || '소속도서관 없음';
            if (!el) return;
            if (library === '소속도서관 없음') {
                el.dataset.verified = 'true';
                el.className = 'mt-2 text-[11px] text-gray-500';
                el.innerText = '소속도서관 없이 가입합니다.';
                return;
            }
            el.dataset.verified = 'false';
            el.className = 'mt-2 text-[11px] text-gray-400';
            el.innerText = '아직 인증되지 않았습니다.';
        }

        function verifySignupLibrary() {
            const el = document.getElementById('signup-library-verified');
            const library = document.getElementById('signup-library')?.value || '소속도서관 없음';
            if (el) {
                el.dataset.verified = 'true';
                el.className = 'mt-2 text-[11px] text-brand-sageDark font-bold';
                el.innerText = library === '소속도서관 없음' ? '소속도서관 없이 가입합니다.' : `${library} 인증 완료`;
            }
            showToast(library === '소속도서관 없음' ? '소속도서관 없이 가입합니다.' : '소속도서관 인증이 완료되었습니다.');
        }

        const TASTE_DIAGNOSIS_QUESTIONS = [
            { key: 'mood', text: '책을 읽고 어떤 기분이 가장 좋으세요?', options: ['힐링', '생각할 거리', '감동', '몰입감', '새로운 지식'] },
            { key: 'genre', text: '영화나 콘텐츠를 고른다면 어떤 장르가 끌리나요?', options: ['로맨스/드라마', '다큐/실화', '미스터리', '판타지/SF', '역사/교양'] },
            { key: 'purpose', text: '책을 읽는 가장 큰 이유는 무엇인가요?', options: ['휴식', '성장', '공부', '대화거리', '상상력'] },
            { key: 'pace', text: '어떤 책이 더 편하게 느껴지나요?', options: ['잔잔한 문장', '깊은 사유', '빠른 전개', '실용적인 내용', '새로운 세계관'] },
            { key: 'tryNew', text: '새로운 분야의 책도 도전하는 편인가요?', options: ['자주 도전', '가끔 도전', '익숙한 분야 선호'] }
        ];
        let tasteDiagnosisStep = 0;
        let tasteDiagnosisAnswers = {};

        function openTasteDiagnosis() {
            tasteDiagnosisStep = 0;
            tasteDiagnosisAnswers = {};
            const modal = document.getElementById('taste-diagnosis-modal');
            if (modal) modal.classList.remove('hidden');
            renderTasteDiagnosisQuestion();
        }

        function closeTasteDiagnosis() {
            const modal = document.getElementById('taste-diagnosis-modal');
            if (modal) modal.classList.add('hidden');
        }

        function resetTasteDiagnosis() {
            tasteDiagnosisStep = 0;
            tasteDiagnosisAnswers = {};
            renderTasteDiagnosisQuestion();
        }

        function renderTasteDiagnosisQuestion() {
            const area = document.getElementById('taste-question-area');
            if (!area) return;
            const q = TASTE_DIAGNOSIS_QUESTIONS[tasteDiagnosisStep];
            if (!q) { renderTasteDiagnosisResult(); return; }
            area.innerHTML = `
                <div class="rounded-2xl border border-brand-ivoryDark bg-white p-5 shadow-sm animate-fadeIn">
                    <div class="text-[11px] font-bold text-brand-sageDark mb-2">질문 ${tasteDiagnosisStep + 1} / ${TASTE_DIAGNOSIS_QUESTIONS.length}</div>
                    <div class="serif-title text-xl font-bold text-brand-navy mb-4">${q.text}</div>
                    <div class="grid sm:grid-cols-2 gap-2">
                        ${q.options.map(opt => `<button type="button" onclick="answerTasteDiagnosis('${q.key}', '${opt.replace(/'/g, "\\'")}')" class="text-left px-4 py-3 rounded-xl bg-brand-ivory/60 hover:bg-brand-sageLight border border-brand-ivoryDark text-sm font-bold text-brand-navy transition-colors">${opt}</button>`).join('')}
                    </div>
                </div>
            `;
        }

        function answerTasteDiagnosis(key, value) {
            tasteDiagnosisAnswers[key] = value;
            tasteDiagnosisStep += 1;
            renderTasteDiagnosisQuestion();
        }

        function analyzeTasteDiagnosis() {
            const a = tasteDiagnosisAnswers;
            let result = { icon: '🌿', type: '감성 탐험가', tags: ['소설','에세이','심리','인문','시'], books: ['달러구트 꿈 백화점', '불편한 편의점', '어서 오세요, 휴남동 서점'], mates: ['달빛독서가', '문장수집가', '사유올빼미'], groups: ['힐링소설 읽기', '문장필사 모임'] };
            if (a.genre === '판타지/SF' || a.purpose === '상상력' || a.pace === '새로운 세계관') result = { icon: '🚀', type: '상상 설계자', tags: ['판타지','SF','소설','추리','과학'], books: ['프로젝트 헤일메리', '해리 포터와 마법사의 돌', '삼체'], mates: ['책읽는고양이', '밤의독서가', '달빛독서가'], groups: ['장르문학 탐험대', 'SF 상상 독서모임'] };
            else if (a.mood === '새로운 지식' || a.purpose === '공부' || a.pace === '실용적인 내용') result = { icon: '🔬', type: '지식 연구자', tags: ['과학','경제','재테크','논픽션','역사'], books: ['도둑맞은 집중력', '사피엔스', '돈의 심리학'], mates: ['밤의독서가', '지혜의등대', '초록책갈피'], groups: ['지식확장 북클럽', '경제교양 읽기'] };
            else if (a.mood === '생각할 거리' || a.pace === '깊은 사유') result = { icon: '🧠', type: '깊은 사색가', tags: ['인문','철학','심리','고전','사회'], books: ['아주 작은 습관의 힘', '참을 수 없는 존재의 가벼움', '소크라테스 익스프레스'], mates: ['사유올빼미', '지혜의등대', '초록책갈피'], groups: ['생각이 깊어지는 인문독서', '질문하는 독서모임'] };
            else if (a.genre === '역사/교양') result = { icon: '🏛', type: '인문 산책가', tags: ['역사','인문','예술','고전','여행'], books: ['역사의 쓸모', '나의 문화유산답사기', '방구석 미술관'], mates: ['초록책갈피', '사유올빼미', '밤의독서가'], groups: ['역사 산책 독서모임', '예술과 인문학 읽기'] };
            else if (a.purpose === '성장') result = { icon: '💼', type: '성장 전략가', tags: ['자기계발','경제','재테크','심리','인문'], books: ['원씽', '돈의 심리학', '아주 작은 습관의 힘'], mates: ['지혜의등대', '밤의독서가', '달빛독서가'], groups: ['성장 독서 루틴', '재테크 입문 북클럽'] };
            return result;
        }

        function renderTasteDiagnosisResult() {
            const area = document.getElementById('taste-question-area');
            if (!area) return;
            const r = analyzeTasteDiagnosis();
            area.innerHTML = `
                <div class="rounded-[1.5rem] border border-brand-sage/30 bg-brand-sageLight/40 p-6 text-center animate-fadeIn">
                    <div class="text-5xl mb-3">${r.icon}</div>
                    <div class="text-xs font-bold text-brand-sageDark tracking-[0.2em] mb-2">진단 결과</div>
                    <div class="serif-title text-3xl font-bold text-brand-navy mb-3">${r.type}</div>
                    <p class="text-sm text-gray-600 leading-relaxed mb-5">모아가 추천하는 취향 키워드를 회원가입 정보에 반영할게요.</p>
                    <div class="flex flex-wrap justify-center gap-2 mb-5">${r.tags.map(t => `<span class="px-3 py-1.5 rounded-full bg-white border border-brand-ivoryDark text-xs font-bold text-brand-navy">#${t}</span>`).join('')}</div>
                    <div class="grid sm:grid-cols-3 gap-3 text-left mb-5">
                        <div class="rounded-2xl bg-white p-4 border border-brand-ivoryDark"><b class="text-xs text-brand-navy">📚 추천도서</b><p class="text-[11px] text-gray-500 mt-2 leading-relaxed">${r.books.join('<br>')}</p></div>
                        <div class="rounded-2xl bg-white p-4 border border-brand-ivoryDark"><b class="text-xs text-brand-navy">😊 추천 북메이트</b><p class="text-[11px] text-gray-500 mt-2 leading-relaxed">${r.mates.join('<br>')}</p></div>
                        <div class="rounded-2xl bg-white p-4 border border-brand-ivoryDark"><b class="text-xs text-brand-navy">🌿 추천 모임</b><p class="text-[11px] text-gray-500 mt-2 leading-relaxed">${r.groups.join('<br>')}</p></div>
                    </div>
                    <button type="button" onclick="applyTasteDiagnosisResult()" class="w-full py-3.5 rounded-xl bg-brand-navy text-white text-sm font-bold hover:bg-brand-navyLight transition-colors">이 취향으로 적용하기</button>
                </div>
            `;
        }

        function applyTasteDiagnosisResult() {
            const r = analyzeTasteDiagnosis();
            document.querySelectorAll('input[name="signup-taste"]').forEach(el => { el.checked = r.tags.includes(el.value); });
            const typeEl = document.getElementById('signup-reading-type');
            const iconEl = document.getElementById('signup-reading-type-icon');
            if (typeEl) typeEl.value = r.type;
            if (iconEl) iconEl.value = r.icon;
            const resultEl = document.getElementById('signup-ai-result');
            if (resultEl) {
                resultEl.classList.remove('hidden');
                resultEl.innerHTML = `<b class="text-brand-navy">${r.icon} ${r.type}</b><div class="text-xs text-gray-500 mt-1">AI가 추천한 취향: ${r.tags.map(t => '#'+t).join(' ')}</div>`;
            }
            closeTasteDiagnosis();
            showToast('AI 독서취향 진단 결과가 적용되었습니다.');
        }

        function handleSignupSubmit(event) {
            event.preventDefault();
            const users = getAuthUsers();
            const id = document.getElementById('signup-id')?.value.trim();
            const password = document.getElementById('signup-password')?.value || '';
            const confirm = document.getElementById('signup-password-confirm')?.value || '';
            const name = document.getElementById('signup-name')?.value.trim();
            const age = Number(document.getElementById('signup-age')?.value || 0);
            const gender = document.getElementById('signup-gender')?.value;
            const nickname = document.getElementById('signup-nickname')?.value.trim();
            const library = document.getElementById('signup-library')?.value;
            const libraryVerified = library === '소속도서관 없음' || document.getElementById('signup-library-verified')?.dataset.verified === 'true';
            const tastes = Array.from(document.querySelectorAll('input[name="signup-taste"]:checked')).map(el => el.value);
            const readingType = document.getElementById('signup-reading-type')?.value || '';
            const readingTypeIcon = document.getElementById('signup-reading-type-icon')?.value || '';

            if (!id || id.length < 4) { showToast('아이디는 4자 이상 입력해 주세요.', 'error'); return; }
            if (users.some(u => u.id === id)) { showToast('이미 사용 중인 아이디입니다.', 'error'); return; }
            if (password.length < 4) { showToast('비밀번호는 4자 이상 입력해 주세요.', 'error'); return; }
            if (password !== confirm) { showToast('비밀번호 확인이 일치하지 않습니다.', 'error'); return; }
            if (!name || !nickname || !age || !gender) { showToast('이름, 나이, 성별, 닉네임을 입력해 주세요.', 'error'); return; }
            if (!libraryVerified) { showToast('소속도서관 인증을 먼저 완료해 주세요.', 'error'); return; }
            if (tastes.length === 0) { showToast('독서취향을 1개 이상 선택해 주세요.', 'error'); return; }

            const user = {
                id, password, name, age, gender, nickname, library, libraryVerified, tastes, readingType, readingTypeIcon,
                avatarType: 'moa', avatarId: ((users.length % 4) + 1), avatarImage: '',
                readBooksCount: 0, gatheringCount: 0, chatMessagesCount: 0,
                missions: createDefaultFirstMissions(), achievements: [], loungeRewards: []
            };
            users.push(user);
            saveAuthUsers(users);
            document.getElementById('auth-signup-form')?.reset();
            resetSignupLibraryVerification();
            applyLoggedInUser(user);
            setTimeout(() => showFirstMissionModal(), 300);
        }

        function createDefaultFirstMissions() {
            return { firstBook:false, firstAI:false, firstReview:false, firstBookmate:false, firstGathering:false };
        }
        const FIRST_MISSION_REWARDS = {
            firstBook: '책장', firstAI: '말풍선', firstReview: '액자', firstBookmate: '화분', firstGathering: '다과세트'
        };
        function ensureUserMissions() {
            if (!state.currentUser || state.currentUser.isGuest) return null;
            if (!state.currentUser.missions) state.currentUser.missions = createDefaultFirstMissions();
            if (!state.currentUser.achievements) state.currentUser.achievements = [];
            if (!state.currentUser.loungeRewards) state.currentUser.loungeRewards = [];
            return state.currentUser.missions;
        }
        function showFirstMissionModal() {
            if (!state.currentUser || state.currentUser.isGuest) return;
            ensureUserMissions();
            const nick = state.currentUser.nickname || '회원';
            const msg = document.getElementById('first-mission-welcome');
            if (msg) msg.textContent = `${nick}님, 이제 책을 읽고, 생각을 나누고, 사람을 만나며 나만의 독서 이야기를 만들어가 보세요.`;
            renderFirstMissionButtons();
            const modal = document.getElementById('first-mission-modal');
            if (modal) modal.classList.remove('hidden');
        }
        function closeFirstMissionModal() {
            const modal = document.getElementById('first-mission-modal');
            if (modal) modal.classList.add('hidden');
        }
        function renderFirstMissionButtons() {
            const missions = ensureUserMissions();
            if (!missions) return;
            document.querySelectorAll('.first-mission-btn').forEach(btn => {
                const key = btn.dataset.mission;
                const done = !!missions[key];
                btn.classList.toggle('bg-brand-sageLight', done);
                btn.classList.toggle('border-brand-sage', done);
                const b = btn.querySelector('b');
                if (b && done && !b.textContent.includes('완료')) b.textContent = '✅ ' + b.textContent.replace(/^✅\s*/, '') + ' 완료';
            });
        }
        function completeFirstMission(key) {
            const missions = ensureUserMissions();
            if (!missions || !FIRST_MISSION_REWARDS[key]) return;
            missions[key] = true;
            const reward = FIRST_MISSION_REWARDS[key];
            if (!state.currentUser.loungeRewards.includes(reward)) state.currentUser.loungeRewards.push(reward);
            if (!state.currentUser.achievements.includes(key)) state.currentUser.achievements.push(key);
            saveAppState();
            renderFirstMissionButtons();
            showToast(`${reward} 아이템을 획득했어요!`);
        }

        function logoutBookmate() {
            localStorage.removeItem(AUTH_SESSION_KEY);
            state.currentUser = createGuestUser();
            applyActivityDataForAccount(state.currentUser);
            saveAppState();
            refreshAccountBoundViews();
            updateAuthHeader();
            updateGuestHomeVisibility();
            showToast('로그아웃했습니다. 메인 화면은 게스트 상태로 유지됩니다.');
        }


        function sayHelloToReader(name) { showToast(`${name}님에게 인사를 건넸습니다! 🙋`); }
        window.onload = function() {
            loadAppState();
            initAuthSystem();
            updateGuestHomeVisibility();
            lucide.createIcons();
            updateUIProfileData();
            renderSocialFeed();
            renderDiscussionWidgets();
            renderGatheringsGrid();
            renderMyPageGatherings();
            loadBookCover('채식주의자', 'home-question-cover', 'w-14 h-20 object-cover rounded-xl shadow-sm', 'https://image.aladin.co.kr/product/29137/2/cover500/8936434594_2.jpg', { title: '채식주의자', author: '한강', isbn: '9788936434595' });
            preloadBookCovers([...state.recentBooks, ...state.gatherings.map(g => ({ title: g.book, author: g.author, isbn: g.isbn, coverUrl: g.coverUrl }))]);
            
            // AI 채팅 초기화 호출
            state.currentAIMode = normalizeAIModeKey(state.currentAIMode || 'debate');
            resetAIChat(state.currentAIBook || '', state.currentAIMode);
            renderAIHistoryList();
            
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
  if (window.bookmateVisitedLoungeAuthor && typeof findAccountByNickname === 'function') {
    const visited = findAccountByNickname(window.bookmateVisitedLoungeAuthor);
    const authorPostCount = (state.socialPosts || []).filter(p => p.author === window.bookmateVisitedLoungeAuthor).length;
    if (visited) {
      return {
        completedBooks: Number(visited.readBooksCount || 0),
        libraryVerified: visited.libraryVerified ? 1 : 0,
        aiDebates: Math.max(3, Math.floor(Number(visited.chatMessagesCount || 0) / 500)),
        discussionPosts: Math.max(authorPostCount, 5),
        bookmates: Math.max(7, Math.floor(Number(visited.readBooksCount || 0) / 5)),
        joinedGatherings: Number(visited.gatheringCount || 0),
        guestbookWrites: 5,
        liveMeetings: Number(visited.gatheringCount || 0) * 2
      };
    }
  }
  if (state.currentUser && (state.currentUser.isGuest || !isSeedAccount(state.currentUser.id))) {
    return { completedBooks: 0, libraryVerified: 0, aiDebates: 0, discussionPosts: 0, bookmates: 0, joinedGatherings: 0, guestbookWrites: 0, liveMeetings: 0 };
  }
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
  if (window.bookmateVisitedLoungeAuthor) {
    loungeBookmates = DEFAULT_BOOKMATES.slice();
    return;
  }
  if (state.currentUser && (state.currentUser.isGuest || !isSeedAccount(state.currentUser.id))) {
    loungeBookmates = [];
    return;
  }
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
  if (state.currentUser && (state.currentUser.isGuest || !isSeedAccount(state.currentUser.id))) return base;
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
  const visitingAuthor = window.bookmateVisitedLoungeAuthor || '';
  const titleEl = document.querySelector('#view-booklounge h1');
  if (titleEl) titleEl.textContent = visitingAuthor ? `${visitingAuthor}님의 북라운지` : '나의 북라운지';
  const stageText = document.getElementById('official-lounge-stage-text');
  if (stageText) stageText.textContent = visitingAuthor ? `${visitingAuthor}님의 활동으로 채워진 북라운지입니다.` : '나의 활동으로 채워지는 북라운지, 독서 인연을 늘려보세요.';

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
  if (typeof isGuestUser === 'function' && isGuestUser()) {
    if (typeof renderGuestGate === 'function') renderGuestGate({icon:'🤝', title:'같은 책을 좋아하는 사람들과 만나보세요.', desc:'BOOKMATE가 되어 독서 친구를 만들고\n책으로 연결되어 보세요.'});
    if (typeof navigate === 'function') navigate('guest-gate');
    return;
  }
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

// 북라운지는 로그인/게스트 상태가 정해진 뒤 렌더링합니다.
setTimeout(() => { loadLoungeBookmates(); renderOfficialLounge(); }, 0);
