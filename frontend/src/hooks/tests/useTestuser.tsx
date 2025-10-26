export default  function useTestUser() {
    async function tryuserfetch () {
    try{
        const res = await fetch('http://localhost/api/test_verification', {
            method: "GET",
            credentials: "include", 
            headers: {
                "Content-Type": "application/json"
            }});
        
        if (!res.ok) {
            console.log("Fatal error in Response", res);
        }

        const data = await res.json();
        const userinfo = data?.user_info;

        return userinfo;
    }

    catch (e) {
        console.log('Error Found while Fetching User data', e);
        return null;
    }}
    

    return {
        tryuserfetch
    }
}