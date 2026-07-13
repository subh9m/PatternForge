// ==UserScript==
// @name         PatternForge LeetCode Syncer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Sync solved LeetCode problems list to PatternForge local database
// @author       Antigravity
// @match        https://leetcode.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @connect      localhost
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    // Register Tampermonkey menu commands for configuration
    GM_registerMenuCommand("Configure PatternForge Server", configureServer);
    GM_registerMenuCommand("Configure Sync Token", configureToken);

    function configureServer() {
        const currentUrl = GM_getValue("pf_server_url", "http://localhost:8081");
        const newUrl = prompt("Enter your PatternForge Backend URL:", currentUrl);
        if (newUrl !== null) {
            GM_setValue("pf_server_url", newUrl.trim().replace(/\/$/, ""));
            alert("PatternForge Server URL updated.");
        }
    }

    function configureToken() {
        const currentToken = GM_getValue("pf_sync_token", "");
        const newToken = prompt("Enter your PatternForge Sync Token:", currentToken);
        if (newToken !== null) {
            GM_setValue("pf_sync_token", newToken.trim());
            alert("PatternForge Sync Token updated.");
        }
    }

    // Insert UI elements
    const container = document.createElement('div');
    container.id = 'pf-sync-widget';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '999999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-end';
    container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    container.style.gap = '6px';

    const statusBubble = document.createElement('div');
    statusBubble.id = 'pf-sync-status';
    statusBubble.style.background = '#1e1e2e';
    statusBubble.style.color = '#cdd6f4';
    statusBubble.style.border = '1px solid #45475a';
    statusBubble.style.borderRadius = '8px';
    statusBubble.style.padding = '8px 12px';
    statusBubble.style.fontSize = '12px';
    statusBubble.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    statusBubble.style.display = 'none';
    statusBubble.style.transition = 'all 0.3s ease';

    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.gap = '6px';

    const syncBtn = document.createElement('button');
    syncBtn.innerText = 'PF ↻';
    syncBtn.style.background = '#e67e22'; // amber/orange
    syncBtn.style.color = '#ffffff';
    syncBtn.style.border = 'none';
    syncBtn.style.borderRadius = '50%';
    syncBtn.style.width = '42px';
    syncBtn.style.height = '42px';
    syncBtn.style.cursor = 'pointer';
    syncBtn.style.fontWeight = 'bold';
    syncBtn.style.fontSize = '14px';
    syncBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    syncBtn.style.transition = 'all 0.2s ease';

    syncBtn.onmouseover = () => {
        syncBtn.style.transform = 'scale(1.08)';
        syncBtn.style.background = '#d35400';
    };
    syncBtn.onmouseout = () => {
        syncBtn.style.transform = 'scale(1)';
        syncBtn.style.background = '#e67e22';
    };

    const configBtn = document.createElement('button');
    configBtn.innerText = '⚙';
    configBtn.style.background = '#313244';
    configBtn.style.color = '#cdd6f4';
    configBtn.style.border = 'none';
    configBtn.style.borderRadius = '50%';
    configBtn.style.width = '42px';
    configBtn.style.height = '42px';
    configBtn.style.cursor = 'pointer';
    configBtn.style.fontSize = '18px';
    configBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    configBtn.style.transition = 'all 0.2s ease';
    configBtn.style.display = 'none'; // Shown on hover container

    configBtn.onmouseover = () => {
        configBtn.style.background = '#45475a';
    };
    configBtn.onmouseout = () => {
        configBtn.style.background = '#313244';
    };

    container.onmouseenter = () => {
        configBtn.style.display = 'block';
    };
    container.onmouseleave = () => {
        configBtn.style.display = 'none';
    };

    buttonGroup.appendChild(configBtn);
    buttonGroup.appendChild(syncBtn);
    container.appendChild(statusBubble);
    container.appendChild(buttonGroup);
    document.body.appendChild(container);

    configBtn.onclick = () => {
        const token = GM_getValue("pf_sync_token", "");
        const server = GM_getValue("pf_server_url", "http://localhost:8081");
        
        const newServer = prompt("PatternForge Backend URL:", server);
        if (newServer === null) return;
        const newToken = prompt("PatternForge Sync Token:", token);
        if (newToken === null) return;

        GM_setValue("pf_server_url", newServer.trim().replace(/\/$/, ""));
        GM_setValue("pf_sync_token", newToken.trim());
        showStatus("Settings saved successfully!", 3000, "#a6e3a1");
    };

    syncBtn.onclick = async () => {
        const token = GM_getValue("pf_sync_token", "");
        const server = GM_getValue("pf_server_url", "http://localhost:8081");

        if (!token) {
            showStatus("Error: Sync Token not configured! Click ⚙ to setup.", 5000, "#f38ba8");
            return;
        }

        syncBtn.disabled = true;
        showStatus("Fetching solved problems from LeetCode...", 0, "#f9e2af");

        try {
            const solvedIds = await fetchSolvedFromLeetCode();
            showStatus(`Found ${solvedIds.length} solved questions. Syncing to PatternForge...`, 0, "#f9e2af");

            const result = await postToPatternForge(server, token, solvedIds);
            if (result.success) {
                showStatus(
                    `✓ ${result.totalSolved} solved synced.<br/>${result.newlySolved} new PatternForge matches.`,
                    6000,
                    "#a6e3a1"
                );
            } else {
                showStatus(`Failed to sync: ${result.error || "Unknown error"}`, 5000, "#f38ba8");
            }
        } catch (err) {
            console.error("Sync error:", err);
            showStatus(`Failed: ${err.message || "Connection refused"}`, 6000, "#f38ba8");
        } finally {
            syncBtn.disabled = false;
        }
    };

    function showStatus(message, duration = 3000, bgColor = '#1e1e2e') {
        statusBubble.innerHTML = message;
        statusBubble.style.display = 'block';
        statusBubble.style.background = bgColor;
        statusBubble.style.color = bgColor === '#a6e3a1' || bgColor === '#f9e2af' ? '#11111b' : '#cdd6f4';

        if (duration > 0) {
            setTimeout(() => {
                statusBubble.style.display = 'none';
            }, duration);
        }
    }

    async function fetchSolvedFromLeetCode() {
        const categorySlug = "all-code-essentials";
        const limit = 100;
        let skip = 0;
        let hasMore = true;
        const allSolvedIds = new Set();

        const queryStr = `
            query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
                problemsetQuestionList: questionList(
                    categorySlug: $categorySlug
                    limit: $limit
                    skip: $skip
                    filters: $filters
                ) {
                    totalNum
                    questions: data {
                        frontendQuestionId: questionFrontendId
                    }
                }
            }
        `;

        console.log("Starting solved problems sync...");

        while (hasMore) {
            console.log(`[PF Diagnostic] GraphQL Query - Name: problemsetQuestionList, categorySlug: ${categorySlug}, skip: ${skip}, limit: ${limit}`);
            
            const graphqlQuery = {
                query: queryStr,
                variables: {
                    categorySlug: categorySlug,
                    limit: limit,
                    skip: skip,
                    filters: { status: "AC" }
                }
            };

            const response = await fetch("https://leetcode.com/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(graphqlQuery)
            });

            if (!response.ok) {
                throw new Error(`LeetCode GraphQL returned HTTP ${response.status}`);
            }

            const resBody = await response.json();
            if (resBody.errors && resBody.errors.length > 0) {
                const errMsg = resBody.errors[0].message;
                console.error("[PF Sync Error] GraphQL Error:", errMsg, resBody.errors);
                throw new Error(`GraphQL Error: ${errMsg}`);
            }

            const problemset = resBody.data?.problemsetQuestionList;
            if (!problemset) {
                throw new Error("No data returned from LeetCode. Are you logged in?");
            }

            const questions = problemset.questions || [];
            const totalNum = problemset.totalNum || 0;
            const currentHasMore = (questions.length === limit) && (skip + questions.length < totalNum);

            console.log(`[PF Diagnostic] Skip: ${skip}, Limit: ${limit}, Returned: ${questions.length}, hasMore: ${currentHasMore}`);

            for (const q of questions) {
                const id = parseInt(q.frontendQuestionId);
                if (!isNaN(id) && id > 0) {
                    allSolvedIds.add(id);
                }
            }

            hasMore = currentHasMore;
            skip += limit;
        }

        const finalSolvedList = Array.from(allSolvedIds);
        console.log(`[PF Diagnostic] Sync finished. Total fetched unique solved IDs: ${finalSolvedList.length}`);
        return finalSolvedList;
    }

    async function postToPatternForge(server, token, solvedIds) {
        const response = await fetch(`${server}/api/leetcode/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ solvedIds })
        });

        if (response.status === 403 || response.status === 401) {
            throw new Error("Invalid or revoked Sync Token.");
        }

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error || `Server returned HTTP ${response.status}`);
        }

        return await response.json();
    }
})();
