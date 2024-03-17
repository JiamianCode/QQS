// 定义一个函数来更新 teachText 元素的内容
function updateTeachText(newText) {
    const teachTextElement = document.getElementById('teachText');
    if (teachTextElement) {
        teachTextElement.textContent = newText; // 或者使用 .innerHTML，如果需要设置的内容包含HTML标签
    }
}

// 调用这个函数来更新内容
//updateTeachText('您的 CPR 技能已经大大改善！');

function updateTeach(){
    // 初始化一个数组来存储总分
    let totalScores = [0, 0, 0, 0];

    // 遍历 newData 来累加每一类的分数
    newData.forEach(scores => {
        scores.forEach((score, index) => {
            totalScores[index] += Number(score);
        });
    });

    // 计算每一类的平均分并打印结果
    let averageScores = totalScores.map(total => total / newData.length);
    console.log("每一类的平均分是：", averageScores);

    let minScore = Math.min(...averageScores);
    averageScores.forEach((score, index) =>{
        if(score === minScore){
            switch (index) {
                case 0:updateTeachText('请适当调整身体与双臂的夹角！');break;
                case 1:updateTeachText('请在操作过程中将双臂伸直！');break;
                case 2:updateTeachText('请适当调整身体与大腿的夹角！');break;
                case 3:updateTeachText('请适当调整操作过程中的频率！');break;
            }
        }
    })
}



let alertContainer = document.getElementById('alertContainer');
// 添加提示信息
function addAlert(level, score, rangeStart, rangeEnd, reasons) {
    // 根据错误等级选择相应的Bootstrap alert类
    let alertClass;
    switch (level) {
        case '高':
            alertClass = 'alert-danger';
            break;
        case '中':
            alertClass = 'alert-warning';
            break;
        case '低':
            alertClass = 'alert-info';
            break;
        default:
            alertClass = 'alert-secondary';
    }

    // 创建alert HTML结构
    let alertHTML = `<div class="alert-custom ${alertClass}">
                            <div class="row">
                                <div class="col-md-8 alert-heading">错误等级：${level}，分数：${score}</div>
                                <div class="col-md-4 error-range">范围：${rangeStart}-${rangeEnd}</div>
                            </div>
                            <div class="error-detail">`;
    reasons.forEach(reason => {
        alertHTML += `  ${reason}<br>`;
    });
    alertHTML += `    </div>
                        </div>`;

    // 添加到页面中
    alertContainer.innerHTML += alertHTML;

    //滚动到最下方
    alertContainer.scrollTop = alertContainer.scrollHeight;
}

// 示例添加alert
// addAlert('高', 90, '00:10', '00:30', ['原因一', '原因二']);
// addAlert('中', 60, '00:40', '00:50', ['原因一', '原因二']);
// addAlert('低', 30, '01:00', '01:10', ['原因一', '原因二']);

function calculateRelativeDifferences(
    framesPerSegment,
    angle1Min, angle1Max,
    angle2Min, angle2Max,
    angle3Min, angle3Max,
    frequencyMin, frequencyMax) {
    // 辅助函数：计算数组中最后N个元素的平均值
    function calculateAverage(array, count) {
        let slice = array.slice(-count).map(Number); // 确保转换为数字类型
        return slice.reduce((acc, val) => acc + val, 0) / count;
    }

    // 确保每个数组至少有framesPerSegment个元素
    let validFrames = Math.min(framesPerSegment, angle1Array.length, angle2Array.length, angle3Array.length, frequencyArray.length);

    // 计算平均值
    let angle1Avg = calculateAverage(angle1Array, validFrames);
    let angle2Avg = calculateAverage(angle2Array, validFrames);
    let angle3Avg = calculateAverage(angle3Array, validFrames);
    let frequencyAvg = calculateAverage(frequencyArray, validFrames);

    // 计算与标准范围均值的差异比
    let angle1DiffRatio = (angle1Avg - (angle1Min + angle1Max) / 2) / ((angle1Max - angle1Min) / 2);
    let angle2DiffRatio = (angle2Avg - (angle2Min + angle2Max) / 2) / ((angle2Max - angle2Min) / 2);
    let angle3DiffRatio = (angle3Avg - (angle3Min + angle3Max) / 2) / ((angle3Max - angle3Min) / 2);
    let frequencyDiffRatio = (frequencyAvg - (frequencyMin + frequencyMax) / 2) / ((frequencyMax - frequencyMin) / 2);

    // 计算均值之和
    let totalAverage = (angle1Avg + angle2Avg + angle3Avg + frequencyAvg) / validFrames;

    // 记录热力图
    hotData.push([angle1DiffRatio,angle2DiffRatio,angle3DiffRatio,frequencyDiffRatio]);

    return {
        angle1DiffRatio: angle1DiffRatio.toFixed(2),
        angle2DiffRatio: angle2DiffRatio.toFixed(2),
        angle3DiffRatio: angle3DiffRatio.toFixed(2),
        frequencyDiffRatio: frequencyDiffRatio.toFixed(2),
        totalAverage: totalAverage.toFixed(2) // 将均值之和四舍五入到两位小数
    };
}

function updateAlert(beginTime, endTime){
    let result = calculateRelativeDifferences(framesPerSegment,
        minAngleRange1, maxAngleRange1, // Angle 1 Min, Max
        minAngleRange2, maxAngleRange2, // Angle 2 Min, Max
        minAngleRange3, maxAngleRange3, // Angle 3 Min, Max
        minFrequency, maxFrequency); // Frequency Min, Max
    //console.log(result);

    let reasons = [];
    let level;
    let score = parseFloat(result.totalAverage); // 直接从totalAverage获取score

    // 根据差异比的绝对值和符号判断原因
    Object.keys(result).forEach(key => {
        if (key.includes("DiffRatio")) { // 只处理差异比
            let diffRatio = parseFloat(result[key]);
            if (Math.abs(diffRatio) >= 1.5) {
                reasons.push(`${key}的偏差严重，${diffRatio > 0 ? '偏大' : '偏小'}`);
            } else if (Math.abs(diffRatio) >= 1.0) {
                reasons.push(`${key}存在较大偏差，${diffRatio > 0 ? '偏大' : '偏小'}`);
            } else if (Math.abs(diffRatio) >= 0.5) {
                reasons.push(`${key}略有偏差，${diffRatio > 0 ? '略微偏大' : '略微偏小'}`);
            }
        }
    });

    // 根据totalAverage确定等级
    if (score <= 50) {
        level = '高';
    } else if (score <= 60) {
        level = '中';
    } else if (score <= 70) {
        level = '低';
    } else {
        level = '优秀';
    }

    // 如果没有具体原因，则说明所有测量值均在优秀范围内
    if(level !== '优秀'){
        addAlert(level, score.toFixed(2), beginTime, endTime, reasons);
    }
}