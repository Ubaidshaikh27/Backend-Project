const asyncHandler = (requestHander) =>{
    (req, res, next) => {
        Promise.resolve(requestHander(req, res, next)).
        catch(next);
    }
}



export { asyncHandler}