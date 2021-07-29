var Table = require('cli-table');

function CustomTable(head, colWidths = []) {
    this.table = new Table({
        head,
        colWidths
    });
}

CustomTable.prototype.pushToTable = function (data) {
    this.table.push(data)
}
CustomTable.prototype.show = function (heading) {
    console.log(`\n\n***********  ${heading} Start  ***********`)
    console.log(this.table.toString())
    console.log(`***********  ${heading} End  ***********\n\n`)
}


module.exports = CustomTable