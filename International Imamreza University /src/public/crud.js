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


(async() => {
    // LOAD
    // const categories = await read(URL, "category", "?title=Today");
    const categories = await read(URL, "category");
    console.log(categories)
    const tasks = await read(URL, "task");
    console.log(tasks);
})();