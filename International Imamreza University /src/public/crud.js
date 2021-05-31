const URL = 'http://localhost:8080';
class CRUD {
    // this class is common methods to interact with database.
    constructor(address, table) {
        this.address = address;
        this.table = table;
    }
    read = async (query) => {
        try {
            let url = this.address + "/" + this.table + "/?";
            if (query)
                for (const property in query)
                    url += `${property}=${query[property]}&`
            const config = {
                method: "GET"
            }
            const resp = await fetch(url, config);
            const json = await resp.json();
            return json.result.recordset;
        } catch (err) {
            console.error("Error While fetching data, error: ", err);
        }
    }

    create = async (data) => {
        try {
            let url = this.address + "/" + this.table;
            const config = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                },
                body: JSON.stringify(data)
            }
            const resp = await fetch(url, config);
            const json = await resp.json();
            return json.result;
        } catch (err) {
            console.error("Error While Sending data, error: ", err);
        }
    }
    update = async (filter, newValues) => {
        try {
            let url = this.address + "/" + this.table;
            const data = {
                ...filter,
                newValues
            };
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
        } catch (err) {
            console.error("Error While Updating data, error: ", err);
        }
    }
    delete = async (filter) => {
        try {
            let url = this.address + "/" + this.table;
            const data = {
                ...filter
            };
            const config = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                },
                body: JSON.stringify(data)
            }
            const resp = await fetch(url, config);
            const json = await resp.json();
            return json.result.recordset;
        } catch (err) {
            console.error("Error While Deleting data, error: ", err);
        }
    }
}



(async () => {
    // NOTE: usuage of this class
    // let category = new CRUD(URL, "category");
    // const result = await category.read({
    //     title: "Today",
    //     categoryId: 1,
    // });
    // console.log(result)
})();