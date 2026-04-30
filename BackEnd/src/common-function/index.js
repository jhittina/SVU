

exports.objSum = (data, field) => {
    return sumValues = data.map(item => item[`${field}`]).reduce((prev, next) => prev + next);
};

exports.phoneNumber = (number) => {
    const regexPhoneNumber = /^[0-9]{10}$/
    if (number.match(regexPhoneNumber)) {
        return true;
    } else {
        return false;
    }

}
exports.arrayOfObjectfilter = (searchKey, arr) => {
    console.log(arr);
    var results = [];
    var toSearch = searchKey;
    for (var i = 0; i < arr.length; i++) {
        for (key in arr[i]) {
            console.log(key);
            console.log(arr[i][i]);
            if (arr[i][key].indexOf(toSearch) != -1) {
                results.push(arr[i]);
            }
            break
        }
    }
    console.log(results);
};