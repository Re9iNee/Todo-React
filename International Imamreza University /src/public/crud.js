const URL = 'http://localhost:8080';
const read = async (address, table, query) => {
    try {
        let url = address + "/" + table;
        if (query)
            url += "/" + query
    
        const config = {
            method: "GET"
        }
        const resp = await fetch(url, config);
        const json = await resp.json();
        return json.result.recordset;
    } catch(err) {
        console.error("Error While fetching data, error: ", err);
    }
}

const create = async (address, table, data) => {
    try {
        debugger
        let url = address + "/" + table;
        const config = {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify(data)
        }
        const resp = await fetch(url, config);
        const json = await resp.json();
        debugger
        return json.result;
    } catch (err) {
        console.error("Error While Sending data, error: ", err);
    }
}

(async() => {
    // LOAD
    // const categories = await read(URL, "category", "?title=Today");
    const categories = await read(URL, "category");
    console.log(categories)
    const tasks = await read(URL, "task");
    console.log(tasks);
    // WRITE
    const categoryResult = await create(URL, "category", {title: "1300 Resoloutions"});
    console.log(categoryResult)
})();