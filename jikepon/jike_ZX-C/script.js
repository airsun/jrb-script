/**
 * Get Element
 * @param ele
 */
$ = function(ele) {
    var val = null;
    if (typeof(ele) == 'string') {
        val = document.getElementById(ele);
        if (!val) {
            val = $N(ele);

            if (val != null && val.length == 1) {
                val = val[0];
            }
        }
    }

    return val;
}

/**
 * Get Elements
 * @param ele
 */
$N = function (ele) {
    var val = null;
    if (typeof(ele) == 'string') {
        val = document.getElementsByName(ele);
        if (!val || val.length == 0) {
            val = null;
        }

    }

    return val;
}

/**
 * Get TextInput
 * name match & like
 * @param name
 */
$T = function (name) {
    var val = document.getElementsByTagName("input");
    if (!val || val.length == 0) {
        return null;
    }

    var result = new Array();
    for (var i in val) {
        if (typeof(val[i]) != 'object') {
            continue;
        }

        if (val[i].type != "text") {
            continue;
        }

        if (val[i].name.indexOf(name) >= 0) {
            result.push(val[i]);
        }
    }

    return result;
}

/**
 * Get YYYY-MM-DD HH:mm:ss
 */
function getFullDateTime() {
    var nowDate = new Date();
    var month = nowDate.getMonth() +1 ;
    if (month < 10) {
        month = "0" + month;
    }
    var date = nowDate.getDate() ;
    if (date < 10) {
        date = "0" + date;
    }
    var hours = nowDate.getHours();
    if (hours < 10) {
        hours = "0" + hours;
    }
    var minutes = nowDate.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    var seconds = nowDate.getSeconds();
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var val = (nowDate.getYear() + 1900) + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    return val;
}

var parameterMap = {};
var valueMap = {};

/**
 * 保存当前值至valueMap,并判断是否需要联动更新
 * @param name
 * @param value
 */
function updateValue(name, value) {
    if (value == "" || value == null) return;
    valueMap[name] = value;

    //如果没有OP符号，更新其他用到当前对象的输入框
    if (!hasOP(name)) {
        //更新所有将当前输入框对象作为计算参数的输入框
        updateTargetValue(name, value);
    }
}

/**
 * 联动更新
 * @param name
 * @param value
 */
function updateTargetValue(name, value) {
    var targets = $T(name);
    for (var i in targets) {
        var target = targets[i];
        if (target.name == name) {
            target.value = value;
        } else {
        	evalValue(target.name);
        }
    }
}

/**
 * 计算表达式的值
 * 如果表达式中存在尚未输入实际值的变量，则不予eval
 * @param name
 */
function evalValue(name) {
    var nameRe = /([a-zA-Z]\w*)/g;
    var expr = name.replace(nameRe, function() {
        return valueMap[RegExp.$1];
    });

    try {
        var evalResult = parseInt(eval(expr));
        valueMap[name] = evalResult;
        var targets = $N(name);
        for(var i in targets){
	        targets[i].value = evalResult;
		}
    } catch(e) {
        //aint know what to do...
    }
}

/**
 * 根据输入框内容生成最终脚本
 */
function generate() {
	  $j("#s_t").show();
    //设定当前时间
    parameterMap['time'] = getFullDateTime();
    var output = $('template').innerHTML;
    
    //填充输入框值
    for (var key in valueMap) {
        var value = valueMap[key];

        //re = new RegExp("\\$\\{" + key + "\\}","g");
        //need to be more effective
        var replaceTarget = "${" + key + "}";
        while (output.indexOf(replaceTarget) >= 0) {
            output = output.replace(replaceTarget, "<font color='red'>" + value + '</font>');
        }
    }

	//填充预设参数
    for (var key in parameterMap) {
        var value = parameterMap[key];
        re = new RegExp("@\\{" + key + "\\}", "g");
        output = output.replace(re, "<font color='red'>" + value + '</font>');
    }

    $('output_area').innerHTML = output;
}

/**
 * 根据template生产输入区域
 */
function readyTemplate() {
    clean();
    var template = $('template').innerHTML;
    //\w,+,-,*,/,(,) 任意组合
    re = /\$\{([\w+-\\*\/()]+)\}/gi;
    var value = template.replace(re, function() {
        var name = RegExp.$1;
        valueMap[name] = " ";
        return "<input type='text' name='" + name + "' title='" + name + "' onBlur='updateValue(this.name,this.value)'/>";
    });
    
    document.write(value);
}

/**
 * 判断name中是否包含计算符号
 * 弱规则：只要包含\W就算有
 * @param name
 */
function hasOP(name) {
    var reOP = /[\W]/;
    return reOP.test(name);
}

function clean(){
    valueMap = {};
}


