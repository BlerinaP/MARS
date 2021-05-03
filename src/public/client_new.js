let store = Immutable.Map({
    user:  Immutable.Map({
        name: 'Blerina'
    }),
    roverSelected: false,
    roverGallerySelected: false
});
const root = document.getElementById('root');

const updateStore = async (root, store, newStore={}, callback = null) =>{
    let storeNew = store.mergeDeep(newStore);
    await render(root, storeNew);
    if (callback !== null) return callback(storeNew)
};

const render = async (root, store) => {
    root.innerHTML = App(store)
};

// create content
const App = (state) => {
    const user = state.get('user');
    const rovers = state.get('rovers');
    const roverHtml = rovers && rovers.map((rover) => RoverCard(state, rover)).join('');
    const roverGallerySelected = state.get('roverGallerySelected');
    const gallery = roverGallerySelected && roverGallerySelected.get('photos').map((photo) => ShowPhoto(photo)).join('');
    return `
        <main>
           <div class="container-fluid bg-dark" style="min-height: 100vh; height: fit-content">
                <div class="container d-flex h-100 align-items-center">
                     <div class="row py-5">
                        ${GreetingUser(user.get('name'))}  
                        ${roverHtml}
                     </div>
                </div>
                <div class="container">
                   <div class="row">
                        ${roverGallerySelected ? gallery : ''}
                    </div>
                </div>
           </div>
        </main>
    `
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    getRoverList((data) => {
        const rovers = Immutable.Map({
            rovers: Immutable.fromJS(data.rovers)
        });
        updateStore(root, store, rovers)
    });
});

//Card which hold each rover name
const RoverCard = (store, rover) => {
    return (`
         <div class="col-12 col-md-6">
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">Rover Name: <span>${rover.get('name')}</span></h5>
                    <p class="card-text">This rover is launched in ${rover.get('launch_date')}, landing day is ${rover.get('landing_date')}, and is now ${rover.get('status')} also it has ${rover.get('total_photos')} images</p>
                    <button class="btn" onclick="getClickedRover(${stringyFy(store)}, ${stringyFy(rover)})">Learn More</button>
                </div>
            </div>
        </div>
    `)
};


//Greeting user pure function
const GreetingUser = (user) => {
    return(`
        <div class="col-12">
           <p class="greeting-div">Welcome  <span class="username">${user}</span>, You want to learn more about ROVERS ? You are in the right place!</p>
        </div>
    `)
};


//Function to show infos for each selected ROVER
const ShowPhoto = (data) => {
    const src = data.get('img_src');
    const camera = data.get('camera').get('full_name');
    const earthDate = data.get('earth_date');
    const rover = data.get('rover').get('name');
    const landingDate = data.get('rover').get('landing_date');
    const launchDate = data.get('rover').get('launch_date');
    const status = data.get('rover').get('status');
    const article =
        `
        This photo is made from ${camera} for ${rover}.It's status is ${status}. ${rover} is launched on Mars on ${earthDate}
        ${rover} were launched in ${launchDate} and have been public on ${landingDate}
        
        `
    return `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card rover-card">
                <img src="${src}" alt="${rover}">
                <div class="card-body rover">
                    <h1 class="card-title">${rover} by ${camera}</h1>
                    <p class="card-text">${article}</p>
                </div>
            </div>    
        </div>
    
    `
};

const stringyFy = (arguments) => {
    return JSON.stringify(arguments).replace(/"/g, '\'')
};

//function invoked on click of a button, this tells which rover is clicked and the store is updated
const getClickedRover = (store, rover) => {
    const roverSelected = Immutable.Map({
        roverGallerySelected: false,
        roverSelected: Immutable.fromJS({...rover, loading: true})
    });
    updateStore(root, Immutable.fromJS(store), roverSelected, thisRover)
};


const thisRover = (state) => {
    const thisRoverSelected = state.get('roverSelected')
    let name = thisRoverSelected.get('name');
    let date = thisRoverSelected.get('max_date');
    getRoverPhotos(name, date, (data) => {
        const selected = Immutable.Map({
            roverGallerySelected: Immutable.fromJS({ ...data }),
            roverSelected : Immutable.fromJS({ loading: false })
        });
        updateStore(root, state, selected)
    })
};


// FETCHING APIS for rover names and for each rover informations
const getRoverList = (functionCallBack) => {
 fetch('http://localhost:3001/rovers')
     .then(res => res.json())
     .then(json => functionCallBack(json))
};

const getRoverPhotos = (rover, date, functionCallBack) => {
    fetch(`http://localhost:3001/rover/${rover}?max_date=${date}`)
        .then(res => res.json())
        .then(json => functionCallBack(json))
};




