// 生命能量状态五维测评 - 主逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 状态管理
    let currentQuestionIndex = 0;
    let answers = new Array(questions.length).fill(null);
    let userScores = {
        "静·觉察力": 0,
        "觉·接纳度": 0,
        "开·认知重构": 0,
        "愿·内在动力": 0,
        "行·行动力": 0
    };
    
    // DOM元素
    const introContainer = document.getElementById('introContainer');
    const questionsContainer = document.getElementById('questionsContainer');
    const loadingContainer = document.getElementById('loadingContainer');
    const resultContainer = document.getElementById('resultContainer');
    const startBtn = document.getElementById('startBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const dimensionTitle = document.getElementById('dimensionTitle');
    const dimensionDesc = document.getElementById('dimensionDesc');
    
    // 初始化
    initApp();
    
    function initApp() {
        // 绑定事件
        startBtn.addEventListener('click', startTest);
        prevBtn.addEventListener('click', showPreviousQuestion);
        nextBtn.addEventListener('click', showNextQuestion);
        
        // 初始化进度
        updateProgress();
    }
    
    function startTest() {
        introContainer.classList.remove('active');
        questionsContainer.classList.add('active');
        showQuestion(currentQuestionIndex);
    }
    
    function showQuestion(index) {
        const question = questions[index];
        
        // 更新维度信息
        dimensionTitle.textContent = question.dimension;
        dimensionDesc.textContent = question.dimensionDesc;
        
        // 更新问题文本
        questionText.textContent = `${index + 1}. ${question.text}`;
        
        // 清空选项
        optionsContainer.innerHTML = '';
        
        // 创建选项
        question.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            if (answers[index] === option.id) {
                optionElement.classList.add('selected');
            }
            
            optionElement.innerHTML = `
                <span class="option-letter">${option.id}</span>
                <span class="option-text">${option.text}</span>
            `;
            
            optionElement.addEventListener('click', () => selectOption(index, option.id));
            optionsContainer.appendChild(optionElement);
        });
        
        // 更新按钮状态
        prevBtn.disabled = index === 0;
        nextBtn.textContent = index === questions.length - 1 ? '查看结果' : '下一题';
        
        // 更新进度
        updateProgress();
    }
    
    function selectOption(questionIndex, optionId) {
        // 移除之前的选择
        const options = optionsContainer.querySelectorAll('.option');
        options.forEach(opt => opt.classList.remove('selected'));
        
        // 标记当前选择
        const selectedOption = Array.from(options).find(opt => 
            opt.querySelector('.option-letter').textContent === optionId
        );
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
        
        // 保存答案
        answers[questionIndex] = optionId;
        
        // 启用下一题按钮
        nextBtn.disabled = false;
    }
    
    function showPreviousQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion(currentQuestionIndex);
        }
    }
    
    function showNextQuestion() {
        if (currentQuestionIndex < questions.length - 1) {
            // 确保已选择答案
            if (answers[currentQuestionIndex] === null) {
                alert('请先选择答案再继续');
                return;
            }
            
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        } else {
            // 最后一题，计算结果显示结果
            if (answers[currentQuestionIndex] === null) {
                alert('请先选择答案再查看结果');
                return;
            }
            
            calculateResults();
        }
    }
    
    function updateProgress() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `第${currentQuestionIndex + 1}题 / 共${questions.length}题`;
    }
    
    function calculateResults() {
        // 显示加载界面
        questionsContainer.classList.remove('active');
        loadingContainer.classList.add('active');
        
        // 计算维度分数
        questions.forEach((question, index) => {
            const answerId = answers[index];
            if (answerId) {
                const selectedOption = question.options.find(opt => opt.id === answerId);
                if (selectedOption) {
                    userScores[question.dimension] += selectedOption.score;
                }
            }
        });
        
        // 计算总分
        const totalScore = Object.values(userScores).reduce((sum, score) => sum + score, 0);
        
        // 确定能量状态
        const userState = energyStates.find(state => 
            totalScore >= state.minScore && totalScore <= state.maxScore
        );
        
        // 生成维度分析
        const dimensionAnalysis = {};
        Object.keys(userScores).forEach(dimension => {
            const score = userScores[dimension];
            const maxScore = dimensions[dimension].maxScore;
            const percentage = (score / maxScore) * 100;
            
            let level = 'low';
            if (percentage >= 70) level = 'high';
            else if (percentage >= 40) level = 'medium';
            
            dimensionAnalysis[dimension] = {
                score,
                maxScore,
                percentage,
                level,
                analysis: analysisTemplates[dimension][level]
            };
        });
        
        // 延迟显示结果（模拟分析过程）
        setTimeout(() => {
            loadingContainer.classList.remove('active');
            resultContainer.classList.add('active');
            displayResults(totalScore, userState, dimensionAnalysis);
        }, 1500);
    }
    
    function displayResults(totalScore, userState, dimensionAnalysis) {
        // 创建结果页面HTML
        resultContainer.innerHTML = `
            <div class="result-header">
                <h2 class="result-title">你的生命能量状态报告</h2>
                <p class="result-subtitle">基于25道题的深度分析，为你揭示内在能量状态</p>
            </div>
            
            <div class="score-display">
                <div class="total-score">${totalScore}<span style="font-size: 24px;">/100</span></div>
                <div class="score-label">综合能量分数</div>
                <div class="state-badge">${userState.emoji} ${userState.name}</div>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">五维能量雷达图</div>
                <canvas id="radarChart"></canvas>
            </div>
            
            <div class="dimension-scores" id="dimensionScores"></div>
            
            <div class="analysis-section">
                <h3 class="section-title">能量状态分析</h3>
                
                <div class="state-description">
                    <div class="state-name">${userState.emoji} ${userState.name}</div>
                    <div class="state-desc">${userState.description}</div>
                </div>
                
                <div class="strengths-list">
                    <div class="list-title"><i class="fas fa-star"></i> 你的优势</div>
                    <ul class="list-items">
                        ${userState.strengths.map(strength => `<li class="list-item">${strength}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="growth-list">
                    <div class="list-title"><i class="fas fa-seedling"></i> 成长空间</div>
                    <ul class="list-items">
                        ${userState.growthAreas.map(area => `<li class="list-item">${area}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="recommendations">
                    <div class="list-title"><i class="fas fa-heart"></i> 送给你的人生锦囊</div>
                    ${userState.recommendations.map(rec => `
                        <div class="recommendation-item">
                            <div class="recommendation-text">${rec}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="analysis-section">
                <h3 class="section-title">五维详细分析</h3>
                <div id="dimensionDetails"></div>
            </div>
            
            <!-- 简化版私域引流 -->
            <div class="simple-contact-section" style="background: rgba(139, 90, 43, 0.05); border-radius: 12px; padding: 25px; margin-top: 30px; text-align: center; border: 1px solid rgba(139, 90, 43, 0.2);">
                <h3 style="color: #8B5A2B; font-size: 18px; margin-bottom: 15px;">💬 需要深度解析？</h3>
                <p style="color: #5D4037; margin-bottom: 15px; line-height: 1.6;">
                    专业教练的深度解析，能帮你：
                </p>
                <ul style="text-align: left; display: inline-block; margin: 10px 0 20px 0; padding-left: 20px;">
                    <li>真正理解每个维度对你的具体意义</li>
                    <li>获得针对你个人情况的成长建议</li>
                    <li>解答你在关系断裂期的具体困惑</li>
                    <li>开启真正的觉醒重生之旅</li>
                </ul>
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; display: inline-block;">
                    <div style="font-size: 16px; color: #8B5A2B; margin-bottom: 5px;">添加南静老师微信</div>
                    <div style="font-size: 20px; font-weight: bold; color: #07C160;">loveseed001</div>
                    <div style="font-size: 14px; color: #666; margin-top: 5px;">（备注"测评解析"）</div>
                </div>
                <p style="font-size: 14px; color: #888; margin-top: 10px;">
                    微信号已自动复制，打开微信即可添加
                </p>
            </div>
        `;
        
        // 渲染维度分数
        const dimensionScoresContainer = document.getElementById('dimensionScores');
        Object.entries(dimensionAnalysis).forEach(([dimension, data]) => {
            const dimensionItem = document.createElement('div');
            dimensionItem.className = 'dimension-score-item';
            dimensionItem.innerHTML = `
                <div class="dimension-name">${dimension}</div>
                <div class="dimension-score">${data.score}<span style="font-size: 14px; color: #999;">/${data.maxScore}</span></div>
                <div class="progress-container">
                    <div class="progress-bar-small">
                        <div class="progress-small" style="width: ${data.percentage}%"></div>
                    </div>
                </div>
                <div class="dimension-max">${Math.round(data.percentage)}%</div>
            `;
            dimensionScoresContainer.appendChild(dimensionItem);
        });
        
        // 渲染维度详细分析
        const dimensionDetailsContainer = document.getElementById('dimensionDetails');
        Object.entries(dimensionAnalysis).forEach(([dimension, data]) => {
            const detailItem = document.createElement('div');
            detailItem.className = 'dimension-detail-item';
            detailItem.style.marginBottom = '20px';
            detailItem.style.padding = '15px';
            detailItem.style.backgroundColor = 'rgba(139, 90, 43, 0.05)';
            detailItem.style.borderRadius = '8px';
            detailItem.innerHTML = `
                <div style="font-weight: 600; color: #8B5A2B; margin-bottom: 8px;">${dimension}</div>
                <div style="color: #5D4037; line-height: 1.5;">${data.analysis}</div>
                <div style="margin-top: 10px; font-size: 14px; color: #D4A76A;">
                    <i class="fas fa-chart-line"></i> 得分: ${data.score}/${data.maxScore} (${Math.round(data.percentage)}%)
                </div>
            `;
            dimensionDetailsContainer.appendChild(detailItem);
        });
        
        // 渲染雷达图
        renderRadarChart(dimensionAnalysis);
        
        // 绑定结果页面事件
        bindResultEvents();
    }
    
    function renderRadarChart(dimensionAnalysis) {
        // 确保Canvas元素存在且有尺寸
        const canvas = document.getElementById('radarChart');
        if (!canvas) {
            console.error('找不到雷达图Canvas元素');
            return;
        }
        
        // 设置Canvas明确尺寸 - 确保完美的圆形
        const container = canvas.parentElement;
        
        // 强制容器为正方形
        container.style.width = '400px';
        container.style.height = '400px';
        container.style.margin = '0 auto';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        
        // 设置Canvas为固定正方形
        const size = 350; // 固定尺寸，确保完美圆形
        canvas.width = size;
        canvas.height = size;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        
        const ctx = canvas.getContext('2d');
        
        const labels = Object.keys(dimensionAnalysis);
        const scores = Object.values(dimensionAnalysis).map(data => data.percentage);
        const maxScores = new Array(labels.length).fill(100);
        
        // 如果已有图表实例，先销毁
        if (window.radarChartInstance) {
            window.radarChartInstance.destroy();
        }
        
        window.radarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '你的得分',
                        data: scores,
                        backgroundColor: 'rgba(139, 90, 43, 0.2)',
                        borderColor: 'rgba(139, 90, 43, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(139, 90, 43, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    },
                    {
                        label: '满分参考',
                        data: maxScores,
                        backgroundColor: 'rgba(212, 167, 106, 0.1)',
                        borderColor: 'rgba(212, 167, 106, 0.5)',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: false, // 关闭响应式，使用固定尺寸
                maintainAspectRatio: false, // 不保持宽高比，使用固定尺寸
                scales: {
                    r: {
                        beginAtZero: true,
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            backdropColor: 'transparent',
                            display: true
                        },
                        angleLines: {
                            color: 'rgba(212, 167, 106, 0.3)',
                            lineWidth: 1,
                            display: true
                        },
                        grid: {
                            color: 'rgba(212, 167, 106, 0.3)',
                            circular: true,
                            lineWidth: 1
                        },
                        pointLabels: {
                            font: {
                                size: 14,
                                family: "'PingFang SC', 'Microsoft YaHei', sans-serif",
                                weight: '500'
                            },
                            color: '#5D4037',
                            padding: 15
                        },
                        ticks: {
                            backdropColor: 'transparent',
                            color: '#D4A76A',
                            font: {
                                size: 12
                            },
                            stepSize: 20
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14,
                                family: "'PingFang SC', 'Microsoft YaHei', sans-serif"
                            },
                            color: '#5D4037',
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(139, 90, 43, 0.9)',
                        titleFont: {
                            size: 14,
                            family: "'PingFang SC', 'Microsoft YaHei', sans-serif"
                        },
                        bodyFont: {
                            size: 14,
                            family: "'PingFang SC', 'Microsoft YaHei', sans-serif"
                        },
                        padding: 12,
                        cornerRadius: 8
                    }
                }
            }
        });
    }
    
    function bindResultEvents() {
        // 保存报告
        document.getElementById('saveResultBtn').addEventListener('click', function() {
            // 使用StorageManager保存结果
            const resultData = {
                totalScore: totalScore,
                energyState: userState.name,
                dimensionScores: dimensionAnalysis,
                answers: answers,
                userState: userState
            };
            
            const saveResult = StorageManager.saveTestResult(resultData);
            
            if (saveResult.success) {
                // 生成可下载的文本报告
                generateTextReport(resultData);
                alert('✅ 测评结果已成功保存到本地！\n\n下次打开页面时，你可以查看历史记录。\n\n报告ID：' + saveResult.resultId);
            } else {
                alert('❌ 保存失败：' + saveResult.message + '\n\n请检查浏览器设置，确保允许本地存储。');
            }
        });
        
        // 重新测评
        document.getElementById('retakeTestBtn').addEventListener('click', function() {
            // 重置状态
            currentQuestionIndex = 0;
            answers = new Array(questions.length).fill(null);
            userScores = {
                "静·觉察力": 0,
                "觉·接纳度": 0,
                "开·认知重构": 0,
                "愿·内在动力": 0,
                "行·行动力": 0
            };
            
            // 切换回介绍页面
            resultContainer.classList.remove('active');
            introContainer.classList.add('active');
            updateProgress();
        });
        
        // 自动复制微信号功能（结果页面显示时自动执行）
        function autoCopyWechatId() {
            const wechatId = 'loveseed001';
            
            // 使用现代Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(wechatId).then(() => {
                    console.log('微信号已自动复制:', wechatId);
                }).catch(err => {
                    console.log('自动复制失败，使用备用方法');
                    fallbackCopy(wechatId);
                });
            } else {
                fallbackCopy(wechatId);
            }
            
            function fallbackCopy(text) {
                const input = document.createElement('input');
                input.value = text;
                input.style.position = 'fixed';
                input.style.opacity = '0';
                document.body.appendChild(input);
                input.select();
                
                try {
                    document.execCommand('copy');
                    console.log('备用方法复制成功:', text);
                } catch (err) {
                    console.log('复制失败，用户需要手动复制');
                }
                
                document.body.removeChild(input);
            }
        }
        
        // 结果页面显示时自动复制微信号
        setTimeout(autoCopyWechatId, 1000);
        
        // 窗口resize时重新渲染雷达图
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.radarChartInstance && dimensionAnalysis) {
                    window.radarChartInstance.destroy();
                    renderRadarChart(dimensionAnalysis);
                }
            }, 250);
        });
        
        // 分享功能
        document.getElementById('shareWechat').addEventListener('click', function() {
            alert('微信分享功能需要配置微信JS-SDK。在实际部署中，这里会调用微信分享接口。');
        });
        
        document.getElementById('copyLink').addEventListener('click', function() {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                alert('链接已复制到剪贴板！');
            }).catch(err => {
                alert('复制失败，请手动复制链接：' + url);
            });
        });
    }
    
    // 隐私政策和联系链接
    document.getElementById('privacyLink')?.addEventListener('click', function() {
        alert('隐私政策：\n1. 所有测评数据仅用于生成个人报告\n2. 数据不会与第三方共享\n3. 用户可以随时要求删除数据\n4. 联系方式：nanjing_coach@example.com');
    });
    
    document.getElementById('contactLink')?.addEventListener('click', function() {
        alert('联系我们：\n\n✨ 添加南静老师微信，领取一次 1v1个性化深度解析\n✨ 微信：loveseed001\n\n📱 电话：139-5702-6325\n\n💫 灵静花园 · 女性成长陪伴平台');
    });
    
    // 生成文本报告函数
    function generateTextReport(resultData) {
        const reportContent = `
生命能量状态五维测评报告
============================
测评时间：${new Date().toLocaleString('zh-CN')}
综合得分：${resultData.totalScore}/100
能量状态：${resultData.energyState}

五维能量分析：
${Object.entries(resultData.dimensionScores).map(([dimension, data]) => 
    `• ${dimension}: ${data.score}/${data.maxScore} (${Math.round(data.percentage)}%)`
).join('\n')}

详细分析：
${Object.entries(resultData.dimensionScores).map(([dimension, data]) => 
    `【${dimension}】\n${data.analysis}\n`
).join('\n')}

你的优势：
${resultData.userState.strengths.map(strength => `• ${strength}`).join('\n')}

成长空间：
${resultData.userState.growthAreas.map(area => `• ${area}`).join('\n')}

能量锦囊：
${resultData.userState.recommendations.map(rec => `• ${rec}`).join('\n')}

--------------------------------
感谢参与测评！
如需深度解析，请联系：
微信：loveseed001
电话：139-5702-6325
        `.trim();
        
        // 创建可下载的文件
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `生命能量测评报告_${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});