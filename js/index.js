/* pull data */
var ownData = {
  id: "00177",
  name: "0027",
  amount: "003",
  date: "004",
  price: "005",
  aa: "006",
  bb: "007",
  cc: "008",
};
var editables = document.getElementsByClassName("editable");
let datapull = document.getElementById("pull");
datapull.onclick = function () {
  var Data = Object.keys(ownData);
  var Datavalue = Object.values(ownData);
  for (var i = 0; i < Data.length; i++) {
    editables[i].firstChild.innerHTML = `${Data[i]}:${Datavalue[i]}`;
  }
};

/* pull code */
var allevent = (function () {
  var result;
  $.ajax({
    type: "",
    url: "",
    dataType: "json",
    data: "",
    async: false,
    success: function (data) {
      result = data;
    },
  });
  return result;
})();

/* refline */
var boxes = [];
var refnum = 0;
$(document).click(function () {
  let refLine = new RefLine();
  boxes.forEach((item) => {
    let drag = new Dragify(item);
    drag
      .on("move", () => { refLine.check(drag.$elem, ".refbox"); })
      .on("end", () => { refLine.uncheck(); });
  });
});

/**
 * 一维码表单事件
 * @param BarCodeFormModel 一维码生成按钮
 * @param barcodeformModalCenter 一维码模态框
 * @param BarCodeFromOk 确定生成一维码
 * @param j 一维码id
 * @param refnum 自动吸附功能
 * @param allNum 所有功能点击计数
 * @param JsBarcode 一维码插件
 */

var BarCodeFormModel = document.getElementById("BarCodeFormModel");
BarCodeFormModel.onclick = function () {
  $("#barcodeformModalCenter").modal();
};

/* code view */
JsBarcode("#BarCodeView", "data", {
  format: "CODE128",
  height: parseInt($("#BarCodeHeight").val()),
  width: $("#BarCodeWidth").val(),
});

/* use id pull codeID */
$("#loadBarCodeID").click(function () {
  var loadData = (function () {
    var result;
    $.ajax({
      type: "",
      url: "",
      dataType: "json",
      data: "",
      async: false,
      success: function (data) {
        result = data;
      },
    });
    return result;
  })();
});

/* barcode */
var j = 0;
var BarCodeFromOk = document.getElementById("BarCodeFormok");
BarCodeFromOk.onclick = function () {
  $("#codemain").append(
    `<div id=${"Code" + j} style="position: absolute; margin: 0; overflow: hidden;z-index:2" class="BarCodedbclick refbox"><canvas id=${"BarCode" + j}></canvas></div>`
  );

  JsBarcode("#BarCode" + j, $("#BarCodeID").val(), {
    format: $("#BarCodeType").val(),
    height: $("#BarCodeHeight").val(),
    width: $("#BarCodeWidth").val(),
  });

  injectDragger(document.getElementById("Code" + j), { minSize: 52 });

  /* refline */
  boxes.push(Array.from(document.getElementsByClassName("refbox"))[refnum]);

  $("#barcodeformModalCenter").modal("hide");
  var codeval = {
    id: "Code" + j,
    data: $("#BarCodeID").val(),
    format: $("#BarCodeType").val(),
    height: $("#BarCodeHeight").val(),
    width: $("#BarCodeWidth").val(),
  };

  sessionStorage.setItem("Code" + j, JSON.stringify(codeval));
  refnum++;
  j++;
  allNum++;
};

/* barcode Form change view */
$("#BarCodeForm").change(function () {
  JsBarcode("#BarCodeView", $("#BarCodeID").val(), {
    format: $("#BarCodeType").val(),
    height: $("#BarCodeHeight").val(),
    width: $("#BarCodeWidth").val(),
    valid: (valid) => {
      if (valid == false) {
        $("#BarCodeError").html("Error: 条码ID与类型不符");
        setTimeout(function () {
          $("#BarCodeError").html("");
        }, 2000);
      }
    },
  });
});

/* barcode Form change event */
$("#EditBarCodeForm").change(function () {
  JsBarcode("#EditBarCodeView", $("#EditBarCodeID").val(), {
    format: $("#EditBarCodeType").val(),
    height: $("#EditBarCodeHeight").val(),
    width: $("#EditBarCodeWidth").val(),
    valid: (valid) => {
      if (valid == false) {
        $("#EditBarCodeError").html("条码ID与类型不符!!!");
        setTimeout(function () {
          $("#EditBarCodeError").html("");
        }, 2000);
      }
    },
  });
});

/**
 * 二维码表单事件
 * @param QarCodeFormModel 二维码生成按钮
 * @param qarcodeformModalCenter 二维码模态框
 * @param QarCodeFromOk 确定生成二维码
 * @param k 二维码id
 * @param refnum 自动吸附功能
 * @param allNum 所有功能点击计数
 * @param QRCode 二维码插件
 */
var QarCodeFormModel = document.getElementById("QarCodeFormModel");
QarCodeFormModel.onclick = function () {
  $("#qarcodeformModalCenter").modal();
};

/* qrcode view */
QRCode.toCanvas(document.getElementById("QarCodeView"), "data", {
  errorCorrectionLevel: "H",
});

/* use id pull qarcodeID */
$("#loadQarCodeID").click(function () {
  $.ajax({
    type: "",
    url: "",
    dataType: "json",
    data: "",
    async: false,
    success: function (data, status) { },
  });
});

/* qarcode */
var k = 0
var QarCodeFormok = document.getElementById('QarCodeFormok')
QarCodeFormok.onclick = function () {
  $('#codemain').append(`<div id=${'QrCode' + k} style="position: absolute; margin: 0; overflow: hidden;z-index:2" class="QarCodedbclick refbox">
  <canvas id=${'QarCode' + k}></canvas></div>`)

  QRCode.toCanvas(document.getElementById('QarCode' + k), $('#QarCodeID').val(), {
    margin: 1
  })
  injectDragger(document.getElementById('QrCode' + k), { minSize: 30 })

  /* refline */
  boxes.push(Array.from(document.getElementsByClassName('refbox'))[refnum])
  $('#qarcodeformModalCenter').modal('hide')
  var qrcodeval = {
    id: 'QrCode' + k,
    data: $('#QarCodeID').val()
  }
  sessionStorage.setItem('QrCode' + j, JSON.stringify(qrcodeval))
  refnum++
  k++
  allNum++
}

/* qarcode Form change view */
$("#QarCodeForm").change(function () {
  QRCode.toCanvas(
    document.getElementById("QarCodeView"),
    $("#QarCodeID").val(), {
    errorCorrectionLevel: "H",
  }
  );
});

/* qarcode Form change event */
$("#EditQarCodeForm").change(function () {
  QRCode.toCanvas(
    document.getElementById("EditQarCodeView"),
    $("#EditQarCodeID").val(), {
    errorCorrectionLevel: "H",
    margin: 1
  }
  );
});

/* img btn */
$("#img_input2").on("change", function (e) {
  /* img data */
  var file = e.target.files[0];
  if (!file.type.match("image.*")) {
    return false;
  }

  /* render img */
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function (arg) {
    var img = '<div style="position: absolute; margin: 0; overflow: hidden;width: 200px;height:150px;z-index:2" id="loadImg"><img style="max-width:100%;max-height:100%; class="preview" src="' + arg.target.result + '" alt="preview"/></div';

    $("#codemain").append(img);
    injectDragger(document.getElementById("loadImg"), { minSize: 30 });
    boxes.push(Array.from(document.getElementsByClassName("refbox"))[refnum]);
    refnum++;
  };
});

/* Rich text editor */
$(function () {
  window.um = UM.getEditor("container", {
    toolbar: [
      "source | undo redo | bold italic underline strikethrough | superscript subscript | forecolor backcolor | removeformat |",
      "insertorderedlist insertunorderedlist | selectall cleardoc paragraph | fontfamily fontsize", "| justifyleft justifycenter justifyright justifyjustify |",
      "link unlink | emotion | horizontal  preview fullscreen", "formula",
    ],
  });
});

/* editor change */
var eleId;
var allNum = 0;
$("#update").click(function () {
  $("#" + eleId).html(um.getContent());
  $("#exampleModalCenter").modal("hide");
});

/**
 * text文本事件
 * @param textBtn 文本生成
 * @param n 文本框id
 * @param refnum 自动吸附功能
 * @param allNum 所有功能点击计数
 */
var textBtn = document.getElementById("textBtn");
var n = 0;
textBtn.onclick = function () {
  $("#codemain").append(`<div style="position: absolute; margin: 0; overflow: hidden;width: 100px;height:25px;z-index:2"class='editable refbox' 
   id=${"text" + n}><p contenteditable="true">Text</p></div>`);
  injectDragger(document.getElementById("text" + n), { minSize: 25 });

  /* refline */
  boxes.push(Array.from(document.getElementsByClassName("refbox"))[refnum]);
  refnum++;
  n++;
  allNum++;
};

/* print */
var mainPrint = document.getElementById("print");
mainPrint.onclick = function () {
  printJS("codemain", "html");
};

/**
 * line线条事件
 * @param lineBtn 线条生成
 * @param d 线条id
 * @param refnum 自动吸附功能
 * @param allNum 所有功能点击计数
 */
var lineBtn = document.getElementById("line");
var d = 0;
lineBtn.onclick = function () {
  $("#codemain").append(`<div id=${"lineDiv" + d} class='refbox' style="position: absolute; margin: 0; overflow: hidden;width:200px;height:1px;background-color:black;z-index:2"></div>`);
  injectDragger(document.getElementById("lineDiv" + d), { minSize: 1 });

  /* refline */
  boxes.push(Array.from(document.getElementsByClassName("refbox"))[refnum]);
  refnum++;
  d++;
  allNum++;
};

/**
 * box方框事件
 * @param box 方框生成
 * @param h 方框id
 * @param refnum 自动吸附功能
 * @param allNum 所有功能点击计数
 */
var box = document.getElementById("box");
var h = 0;
box.onclick = function () {
  $("#codemain").append(`<div id="${"boxDiv" + h}" class='Box refbox' style="position: absolute; margin: 0; overflow: hidden;
  width:200px;height:200px;border: 1px solid black;z-index:1"></div>`);

  injectDragger(document.getElementById("boxDiv" + h), { minSize: 30 });

  /* refline */
  boxes.push(Array.from(document.getElementsByClassName("refbox"))[refnum]);
  refnum++;
  h++;
  allNum++;
};

/**
 * setting设置事件
 * @param codeSetting 设置
 * @param rulers 主体框
 * @param a 方框的DOMRect对象
 * @param pageHeight 页面高度
 * @param pageWidth 页面宽度
 * @param boxleft 方框左边距
 * @param boxtop 上边距
 * @param boxright 右边距
 * @param boxbottom 下边距
 * @param labelRow 标签行数 
 * @param labelColumn 标签列数 
 * @param labelHeight 标签高度
 * @param labelWidth 标签宽度
 */

let codeSetting = document.getElementById("setting");
let pageHeight = document.getElementById("pageHeight");
let pageWidth = document.getElementById("pageWidth");
let pageMarginLeft = document.getElementById("pageMarginLeft");
let pageMarginRight = document.getElementById("pageMarginRight");
let pageMarginTop = document.getElementById("pageMarginTop");
let pageMarginBottom = document.getElementById("pageMarginBottom");
let labelRow = document.getElementById("labelRow");
let labelColumn = document.getElementById("labelColumn");
let labelHeight = document.getElementById("labelHeight");
let labelWidth = document.getElementById("labelWidth");

codeSetting.onclick = function () {
  $("#codeSetting").modal();
  var rulers = document.getElementsByClassName("rul_wrapper")[0];

  /* page height|width */
  pageHeight.value = rulers.offsetHeight;
  pageWidth.value = rulers.offsetWidth;

  var a;
  var childrens = document.getElementById("codemain").children;
  for (let i = 0; i < childrens.length; i++) {
    if (childrens[i].id.slice(0, childrens[i].id.length - 1) == "boxDiv") {
      a = childrens[i].getBoundingClientRect();
    }
  }

  /* box.pos */
  boxleft = Math.floor(Math.abs(rulers.getBoundingClientRect().left + 20 - a.left));
  boxtop = Math.floor(Math.abs(rulers.getBoundingClientRect().top + 20 - a.top));
  boxright = Math.floor(Math.abs(rulers.getBoundingClientRect().right - a.right));
  boxbottom = Math.floor(Math.abs(rulers.getBoundingClientRect().bottom - a.bottom));

  /* form.value */
  pageMarginLeft.value = boxleft;
  pageMarginTop.value = boxtop;
  pageMarginRight.value = boxright;
  pageMarginBottom.value = boxbottom;
  labelHeight.value = a.height;
  labelWidth.value = a.width;

  var settingok = document.getElementById("settingok");
  var rulerstyle = document.getElementById("ruler");
  settingok.onclick = function () {
    /* page height | width */
    rulerstyle.style.height = pageHeight.value;
    rulerstyle.style.width = pageWidth.value;

    /* event.pos top | left */
    for (let j = 0; j < childrens.length; j++) {
      if (childrens[j].id == "boxDiv0") {
        a.height = Number(labelHeight.value);
        a.width = Number(labelWidth.value);
        childrens[j].style.top = Number(pageMarginTop.value) + 106;
        childrens[j].style.left = Number(pageMarginLeft.value) + 171;
        childrens[j].style.height = Number(labelHeight.value);
        childrens[j].style.width = Number(labelWidth.value);
      }
    }

    /* row column */
    var labelrow = labelRow.value;
    var labelcolumn = labelColumn.value;
    var rowok = a.width * labelrow > Number(pageWidth.value) - 20 ? true : false;
    var columnok = a.height * labelcolumn > Number(pageHeight.value) - 20 ? true : false;

    if (!rowok && !columnok) {
      /* pull text | barcode | qrcode | line | box */
      var prototypeBox = $("#codemain").children("div .Box");
      var prototypeText = $("#codemain").children("div .editable");
      var prototypeBarCode = $("#codemain").children("div .BarCodedbclick");
      var prototypeQarCode = $("#codemain").children("div .QarCodedbclick");
      var prototypeLine = $("#codemain").children("div .refbox")
      var randomNum = 100
      var columnRandomNum = 50
      var columnRun = false
      for (var addnum = 1; addnum < labelRow.value; addnum++) {
        addRow();
        randomNum--;

        /* row end */
        if (addnum == labelRow.value - 1) {
          columnRun = true
        }
      }

      /* column */
      if (columnRun) {
        for (var columnaddnum = 1; columnaddnum < labelColumn.value; columnaddnum++) {
          for (var columnnum = 0; columnnum < labelRow.value; columnnum++) {
            addColumn()
            columnRandomNum--
          }
        }
      }

      /* new row */
      function addRow() {
        /* BoxClone */
        var newBox = prototypeBox.clone();
        /* new id | left */
        newBox = newBox.map(
          (x) => (newBox[x].id = newBox[x].id.slice(0, newBox[x].id.length - 1) + randomNum)
            && (newBox[x].style.left = Number(newBox[x].style.left.slice(0, newBox[x].style.left.length - 2)) + Number(labelWidth.value * addnum))
        );
        $("#codemain").append(newBox.prevObject);

        /* TextClone */
        var newText = prototypeText.clone();
        /* new id | left */
        newText = newText.map(
          (x) => (newText[x].id = newText[x].id.slice(0, newText[x].id.length - 1) + randomNum)
            && (newText[x].style.left = Number(newText[x].style.left.slice(0, newText[x].style.left.length - 2)) + Number(labelWidth.value * addnum))
        );
        $("#codemain").append(newText.prevObject);

        /* LineClone */
        var newLine = prototypeLine.clone();
        /* new id | left */
        newLine = newLine.map(
          (x) => (newLine[x].id = newLine[x].id.slice(0, newLine[x].id.length - 1) + randomNum)
            && (newLine[x].style.left = Number(newLine[x].style.left.slice(0, newLine[x].style.left.length - 2)) + Number(labelWidth.value * addnum))
        );
        $("#codemain").append(newLine.prevObject);

        /* BarCodeClone */
        var newBarCode = prototypeBarCode.clone()
        /* new id | left */
        if (prototypeBarCode.length !== 0) {
          newBarCode = newBarCode.map(
            (x) => (newBarCode[x].id = newBarCode[x].id.slice(0, newBarCode[x].id.length - 1) + randomNum)
              && (newBarCode[x].style.left = Number(newBarCode[x].style.left.slice(0, newBarCode[x].style.left.length - 2)) + Number(labelWidth.value * addnum))
              && (newBarCode[x].firstElementChild.id = newBarCode[x].firstElementChild.id.slice(0, newBarCode[x].firstElementChild.id.length - 1) + randomNum)
          );
          $("#codemain").append(newBarCode.prevObject);
          /* data | editor data */
          var barcodevalue
          if ($("#EditBarCodeID").val() == '') {
            barcodevalue = $("#BarCodeID").val()
            barcodeformat = $("#BarCodeType").val()
            barcodeheight = $("#BarCodeHeight").val()
            barcodewidth = $("#BarCodeWidth").val()
          } else {
            barcodevalue = $("#EditBarCodeID").val()
            barcodeformat = $("#EditBarCodeType").val()
            barcodeheight = $("#EditBarCodeHeight").val()
            barcodewidth = $("#EditBarCodeWidth").val()
          }
          JsBarcode("#BarCode" + randomNum, barcodevalue, {
            format: barcodeformat,
            height: barcodeheight,
            width: barcodewidth,
          });
        }

        /* QrcodeClone */
        var newQarCode = prototypeQarCode.clone()
        /* new id left */
        if (prototypeQarCode.length !== 0) {
          newQarCode = newQarCode.map(
            (x) => (newQarCode[x].id = newQarCode[x].id.slice(0, newQarCode[x].id.length - 1) + randomNum)
              && (newQarCode[x].style.left = Number(newQarCode[x].style.left.slice(0, newQarCode[x].style.left.length - 2)) + Number(labelWidth.value * addnum))
              && (newQarCode[x].firstElementChild.id = newQarCode[x].firstElementChild.id.slice(0, newQarCode[x].firstElementChild.id.length - 1) + randomNum)
          );
          $("#codemain").append(newQarCode.prevObject);
          /* data | editor data */
          var qarcodevalue
          if ($("#EditQarCodeID").val() == '') {
            qarcodevalue = $("#QarCodeID").val()
            qarcodeformat = $("#QarCodeType").val()
            qarcodeheight = $("#QarCodeHeight").val()
            qarcodewidth = $("#QarCodeWidth").val()
          } else {
            qarcodevalue = $("#EditQarCodeID").val()
            qarcodeformat = $("#EditQarCodeType").val()
            qarcodeheight = $("#EditQarCodeHeight").val()
            qarcodewidth = $("#EditQarCodeWidth").val()
          }
          QRCode.toCanvas(document.getElementById("QarCode" + randomNum), qarcodevalue, {
            margin: 1
          });
        }
      }

      /* new column */
      function addColumn() {
        /* ColumnBox clone */
        var newcolumnBox = prototypeBox.clone()

        /* new id | left | top */
        newcolumnBox = newcolumnBox.map(
          (x) => (newcolumnBox[x].id = newcolumnBox[x].id.slice(0, newcolumnBox[x].id.length - 1) + columnRandomNum)
            && (newcolumnBox[x].style.left = Number(newcolumnBox[x].style.left.slice(0, newcolumnBox[x].style.left.length - 2)) + Number(labelWidth.value * columnnum))
            && (newcolumnBox[x].style.top = Number(newcolumnBox[x].style.top.slice(0, newcolumnBox[x].style.top.length - 2)) + Number(labelHeight.value * columnaddnum))
        );
        $("#codemain").append(newcolumnBox.prevObject);

        /* ColumnText clone */
        var newcolumnText = prototypeText.clone();

        /* new id | left | top */
        newcolumnText = newcolumnText.map(
          (x) => (newcolumnText[x].id = newcolumnText[x].id.slice(0, newcolumnText[x].id.length - 1) + columnRandomNum)
            && (newcolumnText[x].style.left = Number(newcolumnText[x].style.left.slice(0, newcolumnText[x].style.left.length - 2)) + Number(labelWidth.value * columnnum))
            && (newcolumnText[x].style.top = Number(newcolumnText[x].style.top.slice(0, newcolumnText[x].style.top.length - 2)) + Number(labelHeight.value * columnaddnum))
        );
        $("#codemain").append(newcolumnText.prevObject);

        /* Line clone */
        var newcolumnLine = prototypeLine.clone();
        /* new id | left | top */
        newcolumnLine = newcolumnLine.map(
          (x) => (newcolumnLine[x].id = newcolumnLine[x].id.slice(0, newcolumnLine[x].id.length - 1) + columnRandomNum)
            && (newcolumnLine[x].style.left = Number(newcolumnLine[x].style.left.slice(0, newcolumnLine[x].style.left.length - 2)) + Number(labelWidth.value * columnnum))
            && (newcolumnLine[x].style.top = Number(newcolumnLine[x].style.top.slice(0, newcolumnLine[x].style.top.length - 2)) + Number(labelHeight.value * columnaddnum))
        );
        $("#codemain").append(newcolumnLine.prevObject);

        /* BarCode clone */
        var newcolumnBarCode = prototypeBarCode.clone()

        /* new id | left | top */
        if (prototypeBarCode.length !== 0) {
          newcolumnBarCode = newcolumnBarCode.map(
            (x) => (newcolumnBarCode[x].id = newcolumnBarCode[x].id.slice(0, newcolumnBarCode[x].id.length - 1) + columnRandomNum)
              && (newcolumnBarCode[x].style.left = Number(newcolumnBarCode[x].style.left.slice(0, newcolumnBarCode[x].style.left.length - 2)) + Number(labelWidth.value * columnnum))
              && (newcolumnBarCode[x].style.top = Number(newcolumnBarCode[x].style.top.slice(0, newcolumnBarCode[x].style.top.length - 2)) + Number(labelHeight.value * columnaddnum))
              && (newcolumnBarCode[x].firstElementChild.id = newcolumnBarCode[x].firstElementChild.id.slice(0, newcolumnBarCode[x].firstElementChild.id.length - 1) + columnRandomNum)
          );
          $("#codemain").append(newcolumnBarCode.prevObject);
          var barcodevalue
          if ($("#EditBarCodeID").val() == '') {
            barcodevalue = $("#BarCodeID").val()
            barcodeformat = $("#BarCodeType").val()
            barcodeheight = $("#BarCodeHeight").val()
            barcodewidth = $("#BarCodeWidth").val()
          } else {
            barcodevalue = $("#EditBarCodeID").val()
            barcodeformat = $("#EditBarCodeType").val()
            barcodeheight = $("#EditBarCodeHeight").val()
            barcodewidth = $("#EditBarCodeWidth").val()
          }
          JsBarcode("#BarCode" + columnRandomNum, barcodevalue, {
            format: barcodeformat,
            height: barcodeheight,
            width: barcodewidth,
          });
        }

        /* Qrcode clone */
        var newcolumnQarCode = prototypeQarCode.clone()
        /* new id | left | top */
        if (prototypeQarCode.length !== 0) {
          newcolumnQarCode = newcolumnQarCode.map(
            (x) => (newcolumnQarCode[x].id = newcolumnQarCode[x].id.slice(0, newcolumnQarCode[x].id.length - 1) + columnRandomNum)
              && (newcolumnQarCode[x].style.left = Number(newcolumnQarCode[x].style.left.slice(0, newcolumnQarCode[x].style.left.length - 2)) + Number(labelWidth.value * columnnum))
              && (newcolumnQarCode[x].style.top = Number(newcolumnQarCode[x].style.top.slice(0, newcolumnQarCode[x].style.top.length - 2)) + Number(labelHeight.value * columnaddnum))
              && (newcolumnQarCode[x].firstElementChild.id = newcolumnQarCode[x].firstElementChild.id.slice(0, newcolumnQarCode[x].firstElementChild.id.length - 1) + columnRandomNum)
          );
          $("#codemain").append(newcolumnQarCode.prevObject);
          /* data | editor data */
          var qarcodevalue
          if ($("#EditQarCodeID").val() == '') {
            qarcodevalue = $("#QarCodeID").val()
            qarcodeformat = $("#QarCodeType").val()
            qarcodeheight = $("#QarCodeHeight").val()
            qarcodewidth = $("#QarCodeWidth").val()
          } else {
            qarcodevalue = $("#EditQarCodeID").val()
            qarcodeformat = $("#EditQarCodeType").val()
            qarcodeheight = $("#EditQarCodeHeight").val()
            qarcodewidth = $("#EditQarCodeWidth").val()
          }
          QRCode.toCanvas(document.getElementById("QarCode" + columnRandomNum), qarcodevalue, {
            margin: 1
          });
        }
      }
      $("#codeSetting").modal("hide");
    } else if (rowok) {
      $("#labelRowError").html("标签宽度超出，请进行调整");
      setTimeout(function () {
        $("#labelRowError").html("");
      }, 2000);
    } else {
      $("#labelColumnError").html("标签高度超出，请进行调整");
      setTimeout(function () {
        $("#labelColumnError").html("");
      }, 2000);
    }
  };
};

/**
 * 清空内容
 * @param $("#codemain") 条码内容区
 */

var Clean = document.getElementById('clean')
Clean.onclick = function () {
  $("#codemain").html('')
  h = 0;
  m = 0;
  n = 0;
  k = 0;
  j = 0;
  refnum = 0;
}

/**
 * 模板加载
 * @param templateBtn 模板加载
 * @param i 每个模板的加载按钮
 * @param b 对应模板的html数据
 * @param l 根据allNum总事件数量进行重载
 * @param n 文本数量
 * @param j	一维码数量
 * @param k 二维码数量
 * @param m 线条数量
 * @param h 方框数量
 * @param refnum 自动吸附
 */

var templateBtn = document.getElementById("template");
for (var i = 0; i < localStorage.length; i++) {
  var a = JSON.parse(localStorage.getItem(localStorage.key(i)));
  $("#modelDiv").append(`<div class="col-md-4"> <img class="card-img-top" src=${a.img} data-holder-rendered="true"style="height: 300px; width: 500px;">
    <div class="card-body"><button type="button" class="btn btn-sm btn-primary" id="${i}">加载</button></div></div>`
  );

  let j = i;
  let b = a;

  /* code */
  $("#" + j).click(function () {
    $("#codemain").html(b.code);
    /* Drag */
    for (var l = 0; l < a.allNum; l++) {
      if (document.getElementById("text" + l)) {
        injectDragger(document.getElementById("text" + l), { minSize: 30 });
      }

      if (document.getElementById("BarCode" + l)) {
        JsBarcode("#BarCode" + l, "default");
        injectDragger(document.getElementById("Code" + l), { minSize: 30 });
      }

      if (document.getElementById("QrCode" + l)) {
        QRCode.toCanvas(document.getElementById("QarCode" + l), "default", {
          margin: 1
        });
        injectDragger(document.getElementById("QrCode" + l), { minSize: 30 });
      }

      if (document.getElementById("lineDiv" + l)) {
        injectDragger(document.getElementById("lineDiv" + l), { minSize: 2 });
      }

      if (document.getElementById("boxDiv" + l)) {
        injectDragger(document.getElementById("boxDiv" + l), { minSize: 30 });
      }

      /* refline */
      boxes.push(Array.from(document.getElementsByClassName("refbox"))[l]);
    }

    /* ruler */
    new ruler({
      container: document.querySelector("#ruler"),
      rulerHeight: 20,
      fontFamily: "arial",
      fontSize: "9px",
      strokeStyle: "black",
      lineWidth: 1,
      enableMouseTracking: true,
      enableToolTip: true,
    });
    $("#templatemodel").modal("hide");
  });
}

templateBtn.onclick = function () {
  $("#templatemodel").modal();
  /* id update */
  n = a.textlength;
  j = a.barcode;
  k = a.qarcode;
  d = a.lineDiv;
  m = a.line;
  h = a.boxDiv;
  refnum = a.refnums;
};

/* save */
var saveTemplate = document.getElementById("save");
saveTemplate.onclick = function () {
  ShowCreateModal();
};

function ShowCreateModal() {
  $("#createFileModal").modal("show");
}

$("#createFileSureBut").click(function () {
  var data = $("#fileName").val();
  /* html => img */
  setTimeout(function () {
    html2canvas(document.getElementById("saveCode")).then(function (canvas) {
      var imgUrl = canvas.toDataURL("image/png");
      var value = {
        code: $("#codemain").html(),
        img: imgUrl,
        allNum: allNum,
        textlength: n,
        barcode: j,
        qarcode: k,
        lineDiv: d,
        boxDiv: h,
        refnums: refnum,
      };
      localStorage.setItem(data, JSON.stringify(value));
    }, 1000);
    setTimeout(function () {
      location.reload();
    }, 2000);
  });
  $("#createFileModal").modal("hide");
});

/**
 * @param EditBarCodeFromOk 生成一维码
 * @param editcodeval 一维码数据
 * @param EditQarCodeFromOk 生成二维码
 * @param editqarcodeval 二维码数据
 */
function injectDragger(ele, config = {}) {
  let removeDragger;
  /* click event */
  ele.addEventListener("click", () => {
    if (!removeDragger) {
      const { removeAllControler, eles } = injectController(ele, config);
      removeDragger = removeAllControler;
      const handleRemove = ({ target }) => {
        if (![...eles, ele].includes(target)) {
          removeDragger && removeDragger();
          removeDragger = undefined;
          document.removeEventListener("mouseup", handleRemove);
        }
      };
      document.addEventListener("mouseup", handleRemove);
    }
  });

  /* dbclick event */
  ele.addEventListener("dblclick", () => {
    if (ele.className == "editable refbox") {
      /* text dbclick event */
      eleId = ele.id;
      $("#exampleModalCenter").modal();
      um.setContent(
        $("#" + ele.id)
          .children()
          .html()
      );

      var textdel = document.getElementById("textdel");
      textdel.onclick = function () {
        ele.innerHTML = "";
        $("#exampleModalCenter").modal("hide");
      };
    } else if (ele.className == "BarCodedbclick refbox") {
      /* barcode dbclick  */
      ele.addEventListener("dblclick", () => {
        /* get data */
        var a = JSON.parse(sessionStorage.getItem(ele.id));
        $("#EditbarcodeformModalCenter").modal();
        JsBarcode("#EditBarCodeView", a.data, {
          format: a.format,
          height: a.height,
          width: a.width,
        });

        /* set Form */
        $("#EditBarCodeID").val(a.data);
        $("#EditBarCodeType").val(a.format);
        $("#EditBarCodeHeight").val(a.height);
        $("#EditBarCodeWidth").val(a.width);
      });

      /* del */
      var BarCodeDel = document.getElementById("BarCodeDel");
      BarCodeDel.onclick = function () {
        var delObj = document.getElementById("" + ele.id);
        delObj.innerHTML = "";
        $("#EditbarcodeformModalCenter").modal("hide");
      };

      /* Form data => barcode */
      var EditBarCodeFromOk = document.getElementById("EditBarCodeFormok");
      EditBarCodeFromOk.onclick = function () {
        JsBarcode("#Bar" + ele.id, $("#EditBarCodeID").val(), {
          format: $("#EditBarCodeType").val(),
          height: $("#EditBarCodeHeight").val(),
          width: $("#EditBarCodeWidth").val(),
        });
        /* update saveData */
        var editcodeval = {
          id: ele.id,
          data: $("#EditBarCodeID").val(),
          format: $("#EditBarCodeType").val(),
          height: $("#EditBarCodeHeight").val(),
          width: $("#EditBarCodeWidth").val(),
        };
        sessionStorage.setItem(ele.id, JSON.stringify(editcodeval));
        $("#EditbarcodeformModalCenter").modal("hide");
      };
    } else if (ele.className == "QarCodedbclick refbox") {
      /* qarcode dbclick event */
      ele.addEventListener("dblclick", () => {
        /* get data */
        var b = JSON.parse(sessionStorage.getItem(ele.id));
        $("#EditqarcodeformModalCenter").modal();
        QRCode.toCanvas(document.getElementById("EditQarCodeView"), b.data);
        /* set formData */
        $("#EditBarCodeID").val(b.data);
      });

      /* del */
      var QarCodeDel = document.getElementById("QarCodeDel");
      QarCodeDel.onclick = function () {
        var delObj = document.getElementById("" + ele.id);
        delObj.innerHTML = "";
        $("#EditqarcodeformModalCenter").modal("hide");
      };

      /* form data => qarcode */
      var EditQarCodeFromOk = document.getElementById("EditQarCodeFormok");
      EditQarCodeFromOk.onclick = function () {
        var qrid = ele.id;
        var num = qrid.split("")[qrid.length - 1];
        QRCode.toCanvas(
          document.getElementById("QarCode" + num),
          $("#EditQarCodeID").val()
        );

        /* update saveData */
        var editqarcodeval = {
          id: ele.id,
          data: $("#EditQarCodeID").val(),
        };

        sessionStorage.setItem(ele.id, JSON.stringify(editqarcodeval));
        $("#EditqarcodeformModalCenter").modal("hide");
      };
    }
  });
}

function injectController(ele, config) {
  /* 获取初始位置 */
  const { x, y, width, height } = ele.getBoundingClientRect();
  const bodyMargin = getPxNumber(getComputedStyle(document.body).margin);
  /* 控件容器 */
  const controlWrapper = document.createElement("div");
  /* 设置目标元素和容器样式 */
  const _style_ = new Proxy(controlWrapper.style, {
    get(o, key) {
      /* get controlWrapper.style.xxx的xxx样式值 */
      let originalStyleValue = Reflect.get(o, key);
      /* 修改key */
      if (
        ["width", "height", "left", "top"].includes(key) &&
        !originalStyleValue
      ) {
        originalStyleValue = controlWrapper.getBoundingClientRect()[key];
      }
      return originalStyleValue;
    },
    set(o, key, val) {
      const pxNumber = getPxNumber(val);
      /* 目标元素style */
      if (["left", "top"].includes(key)) {
        ele.style[key] = `${pxNumber - bodyMargin}px`;
      } else if (["width", "height"].includes(key)) {
        ele.style[key] = val;
      }
      Reflect.set(o, key, val);
      return val;
    },
  });
  /* 控件初始样式 */
  Object.assign(controlWrapper.style, {
    position: "fixed",
    width: `${width}px`,
    height: `${height}px`,
    top: `${y}px`,
    left: `${x}px`,
    /* 拖拽移动 */
    cursor: "all-scroll",
    border: "1px dashed #000",
  });
  controlWrapper._style_ = _style_;
  const { removeControler, eles } = createControler(
    controlWrapper,
    {
      width,
      height,
    },
    config
  );
  ele.appendChild(controlWrapper);
  return {
    removeAllControler() {
      removeControler();
      ele.removeChild(controlWrapper);
    },
    eles: [...eles, controlWrapper],
  };
}

function getPxNumber(str) {
  return parseFloat(str, 10);
}

function createControler(ele, { x, y, width, height }, { minSize = 10 }) {
  const { eles } = renderCorner({ x, y, width, height });
  const [tl, tr, bl, br] = eles;
  const handleControlerMouseDown = handleMouseDown(
    (target, detaX, detaY, isMoveTargetElement) => {
      /* 左边两个角 */
      const isLeft = [tl, bl].includes(target);
      /* 上面两个角 */
      const isTop = [tl, tr].includes(target);
      const directionLeft = !isLeft ? 1 : -1;
      const directionTop = !isTop ? 1 : -1;
      /* 新的宽高 */
      let newWidth = getPxNumber(ele._style_.width) + directionLeft * detaX;
      let newHeight = getPxNumber(ele._style_.height) + directionTop * detaY;
      /* 拖拽整个元素时 */
      if (isMoveTargetElement) {
        const newL = getPxNumber(ele._style_.left);
        const newT = getPxNumber(ele._style_.top);
        ele._style_.left = `${newL + detaX}px`;
        ele._style_.top = `${newT + detaY}px`;
        return;
      }

      newWidth = newWidth < minSize ? minSize : newWidth;
      newHeight = newHeight < minSize ? minSize : newHeight;
      /* 拖动四个角 */
      ele._style_.width = `${newWidth}px`;
      ele._style_.height = `${newHeight}px`;
      ele._style_.left = isLeft
        ? `${getPxNumber(ele._style_.left) - directionLeft * detaX}px`
        : ele._style_.left;
      ele._style_.top = isTop
        ? `${getPxNumber(ele._style_.top) - directionTop * detaY}px`
        : ele._style_.top;
    },
    (target, handleMove) => {
      const handleMoveTargetElement = (e) => handleMove(e, true);
      /* 四个角和整个元素的处理 */
      /* 四个角改变宽高 */
      if (eles.includes(target)) {
        document.addEventListener("mousemove", handleMove);
      } else {
        /* 整个元素改变位置 */
        document.addEventListener("mousemove", handleMoveTargetElement);
      }
      document.addEventListener("mouseup", ({ target }) => {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mousemove", handleMoveTargetElement);
      });
    }
  );
  document.addEventListener("mousedown", handleControlerMouseDown);
  eles.forEach((e) => {
    ele.appendChild(e);
  });
  return {
    removeControler() {
      eles.forEach((e) => {
        ele.removeChild(e);
      });
      document.removeEventListener("mousedown", handleControlerMouseDown);
    },
    eles: [...eles, ele],
  };
}

function handleMouseDown(onMove, bindUpAndDown) {
  return function ({ target, clientX: x, clientY: y }) {
    let x0 = x;
    let y0 = y;
    function handleMove(e, ...rest) {
      const { clientX, clientY } = e;
      e.preventDefault();
      const detaX = clientX - x0;
      const detaY = clientY - y0;
      x0 = clientX;
      y0 = clientY;
      onMove(target, detaX, detaY, ...rest);
    }
    bindUpAndDown(target, handleMove);
  };
}

function renderCorner({ width, height }) {
  const eles = Array.from({ length: 4 }).map(() =>
    document.createElement("div")
  );
  eles.forEach((x) => x.classList.add("controller-corner"));
  const [tl, tr, bl, br] = eles;
  Object.assign(tl.style, {
    top: `-5px`,
    left: `-5px`,
    cursor: "nw-resize",
  });
  Object.assign(tr.style, {
    top: `-5px`,
    cursor: "ne-resize",
    right: `-5px`,
  });
  Object.assign(bl.style, {
    bottom: `-5px`,
    cursor: "sw-resize",
    left: `-5px`,
  });
  Object.assign(br.style, {
    bottom: `-5px`,
    cursor: "se-resize",
    right: `-5px`,
  });
  return { eles };
}
