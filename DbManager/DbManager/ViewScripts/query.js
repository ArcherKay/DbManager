$(function () {
    Query();
});



var Query=function() {
    $("#btnQuery").click(function () {
        if ($("#tableName").val() == "") {
            db.error("请选择数据库表名"); return true;
        }
        $.ajax({
            url: "/Home/GetTableStruct",
            data: { tablename: $("#tableName").val() },
            dataType: "json",
            type: "post",
            success: function (data) {
                $("#tbody").html("");
                for (var i = 0; i < data.length; i++) {
                    var strTr = "<tr>";
                    strTr += "<td>" + data[i].FieldName + "</td>";
                    strTr += "<td>" + data[i].FieldType + "</td>";
                    strTr += "<td>" + data[i].IsNull + "</td>";
                    strTr += "<td>" + data[i].IsPK + "</td>";
                    strTr += "<td>" + data[i].IsSelfGrowth + "</td>";
                    strTr += "<td>" + data[i].BytesOccupied + "</td>";
                    strTr += "<td>" + data[i].FieldLength + "</td>";
                    strTr += "<td>" + data[i].FieldBit + "</td>";
                    strTr += "<td>" + data[i].FieldDefault + "</td>";
                    strTr += "<td>" + data[i].FieldDesc + "</td>";
                    strTr += "</tr>";
                    $("#tbody").append(strTr);
                }
            }
        });
    });

}