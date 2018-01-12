// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('echartWra'));
var diagWra = document.getElementById('diagWra');
var errorWra = document.getElementById('errorWra');
var tags = document.getElementById('tags');
var modal = document.getElementById('modal');
var tagLis = tags.children;
var diagIns = document.getElementById('echart').children;
var diagLis = diagWra.children;
var maches = modal.getElementsByTagName('button');
var stat = document.getElementById('stat');
var diagRes = 0;
var isFirst = true;
var error_log = [];

var socket = io();

var data = [];

for(var idx=0;idx<tagLis.length;idx++) {
    tagLis[idx].index = idx;
    tagLis[idx].onclick = function() {
        for(var i = 0;i<tagLis.length;i++) {
            tagLis[i].setAttribute('class', '');
            diagIns[i].setAttribute('class', '');
        }
        tagLis[this.index].setAttribute('class', 'active');
        diagIns[this.index].setAttribute('class', 'active');
    }
}

for(idx=0;idx<maches.length;idx++) {
    maches[idx].onclick = function() {
        stat.innerHTML = `已选机组：${this.innerHTML}`;
        modal.setAttribute('class', 'hide');
        socket.emit('first_connect');
        isFirst = false;
    }
}

socket.on('connect', function() {
    alert('连接成功');
    if(!isFirst) socket.emit('first_connect');
});

// 首次连接获取当前所有数据
socket.on('message', function(init, notify) {
    data = init.chart;
    diagRes = init.diagRes;
    error_log = init.error_log;
    var option = {
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                params = params[0];
                var date = new Date(params.name);
                return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
            },
            axisPointer: {
                animation: false
            }
        },
        xAxis: {
            type: 'time',
            splitLine: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
            splitLine: {
                show: false
            }
        },
        series: [{
            name: '模拟数据',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: data
        }]
    };
    myChart.setOption(option);
    diagLis[diagRes].setAttribute('class', 'active');
    errorWra.innerHTML = '';
    error_log.forEach(function(item) {
        var tmpDom = document.createElement('li');
        tmpDom.innerHTML = `故障类型：${item.error} 故障时间：${item.time}`;
        errorWra.prepend(tmpDom);
    });
    notify();
});

// 更新数据
socket.on('update_data', function(new_data) {
    data.splice(0, 5);
    data = data.concat(new_data.chart);

    myChart.setOption({
        series: [{
            data: data
        }]
    });
    diagLis[diagRes].setAttribute('class', '');
    diagRes = new_data.diagRes;
    diagLis[diagRes].setAttribute('class', 'active');
    if(diagRes>0) {
        var tmpDom = document.createElement('li');
        tmpDom.innerHTML = `故障类型：${diagRes} 故障时间：${new Date().toLocaleString()}`;
        errorWra.prepend(tmpDom);
    }
});