$(function () {
    Query();
});
function Query() {
    $("#btnQuery").click(function () {
        $.ajax({
            url: "/Query/GetQueryJson",
            data: { key: $("#inpTableName").val() },
            dataType: "json",
            type: "post",
            success: function (data) {
                $("#tbody").html("");
                var json = JSON.parse(data);
                for (var i = 0; i < json.Table.length; i++) {
                    var strTr = "<tr>";
                    strTr += "<td>" + json.Table[i].字段名 + "</td>";
                    strTr += "<td>" + json.Table[i].字段类型 + "</td>";
                    strTr += "<td>" + json.Table[i].可否为空 + "</td>";
                    strTr += "<td>" + json.Table[i].是否主键 + "</td>";
                    strTr += "<td>" + json.Table[i].自动增长 + "</td>";
                    strTr += "<td>" + json.Table[i].占用字节 + "</td>";
                    strTr += "<td>" + json.Table[i].长度 + "</td>";
                    strTr += "<td>" + json.Table[i].小数位数 + "</td>";
                    strTr += "<td>" + json.Table[i].默认值 + "</td>";
                    strTr += "<td>" + json.Table[i].字段描述 + "</td>";
                    strTr += "</tr>";
                    $("#tbody").append(strTr);
                }
            }
        });
    });

}