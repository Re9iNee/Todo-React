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
const update = async (address, table, filter, newValues) => {
    try {
        let url = address + "/" + table;
        const data = {...filter, newValues};
        const config = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify(data)
        }
        const resp = await fetch(url, config);
        const json = await resp.json();
        return json.result;
    } catch(err) {
        console.error("Error While Updating data, error: ", err);
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