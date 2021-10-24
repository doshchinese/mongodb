const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/playground',{useNewUrlParser:true})
    .then(()=> console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...',err));

const courseSchema = new mongoose.Schema({
    name:{type: String,
         required:true,
         minlength: 5,
         maxlength: 200
         // match:/pattern/
    },
    category:{
        type: String,
        required: true,
        enum: ['web','mobile','network'],
        lowercase:true,
        trim:true,//automatically remove paddings around our string
        //uppercase:true
    },
    author:String,
    tags:{
        type: Array,
        validate:{
            isAsync:true,
            validator:function(v,callback){
                setTimeout(()=>{
                    const result = v && v.length >0;
                    callback(result);
                },4000);
            },
            message : 'A course needs at least one tag'
        }
    },
    date: { type: Date, default: Date.now },
    isPublished: Boolean,
    price: {
        type:Number,
        required: function (){ return this.isPublished;},
        min: 10,
        max: 200,
        get: v => Math.round(v),
        set: v => Math.round(v)
    }
});

mongoose.model('Course',courseSchema);

const Course = mongoose.model('Course', courseSchema);

async function createCourse(){
    const course = new Course({
        name : ' React JS Course ',
        category:'web',
        author:'Stuart',
        tags:['frontend'],
        isPublished:true,
        price: 15.8
    });
    
    try {
        
        const result = await course.save();
        console.log(result); 
    } catch (err) {
        for (field in err.errors)
            console.log(err.errors[field].message);
    }    
}

async function getCourses(){
    return await Course
    .find({ isPublished:true, tags:{ $in: ['frontend','backend']}})
    .or([
        { price:{$gte:15}},
        { name: /.*by.*/i}
    ])
    .sort('-price')
    .select('name author price');
    //.count();//returns the number of documents that match criteria
}

async function run(){
    const courses = await getCourses();
    console.log(courses);
}

// createCourse();
run();
