import { Component, OnInit,HostBinding } from '@angular/core';
import { viaje, viaje_id, fotos_viaje, doc_viaje } from 'src/app/models/viajes';
import {ViajesService} from '../../services/viajes.service';
import { Router, ActivatedRoute } from '@angular/router';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-viajes-from',
  templateUrl: './viajes-from.component.html',
  styleUrls: ['./viajes-from.component.css']
})
export class ViajesFromComponent implements OnInit {
  aux2=0;
  aux3=0;
  //actualizar viaje
  edit:boolean=false;
  viaje_ID:string;
  //crear viaje
  viaje: viaje={
    Viaje_ID:null,
    Fecha_inicial:new Date,
    Fecha_final:new Date,
    Motivo:'',
    Lugar:'',
    Proyecto_Proy_ID:null,
    Descripcion:''
  }
  aux:Date=new Date;
  proyecto_id:number=parseInt(localStorage.getItem("Proy_ID"));
  Ultimo_viaje:any;
  imagenes:Array<File>;
  documentos:Array<File>;

  constructor(private viajes:ViajesService, private router: Router, private activatedRoute: ActivatedRoute,private http:HttpClient) { }
    urlImg="http://localhost:3000/5d0427599bd5f.jpeg";

  ngOnInit(): void {
    //si existe un parametro en la ruta significa que tengo que actualizar el viaje del id que me pasaron por parametro
    const params = this.activatedRoute.snapshot.params;
    if (params.id) {
      this.viajes.getViajesID(params.id)
        .subscribe(
          res => {
            this.viaje= res[0];
            console.log(this.viaje)
            //this.viaje.Fecha_inicial=new Date(`${this.viaje.Fecha_inicial.getFullYear()}-${this.viaje.Fecha_inicial.getMonth()}-${this.viaje.Fecha_inicial.getDate()}`);
            let fecha = new Date(this.viaje.Fecha_final);
            console.log(typeof fecha)
            this.edit = true;
            console.log(this.edit);
          },
          err => console.log(err)
        )
    }
  }

  ActualizarViaje(){
    this.Ultimo_viaje=this.viaje.Viaje_ID;
    delete this.viaje.Proyecto_Proy_ID;
    this.viajes.updateViaje(this.viaje)
      .subscribe(
        res => {
          console.log('viaje actualizado con exito')
         console.log(res);
          //actualizar imagenes y/o docuemntos
          this.guardarRutasDoc();
          this.subirDoc();
          this.guardarRutasImg();
          this.subirImagenes();
          this.router.navigate(['viajes']);
        },
        err => console.error(err)
      )


  }

  onImgChange(e){
    this.aux3=this.aux3+1;
    //cargo los archivos al arreglo img
    console.log(e.target.files);
    if(e.target.files.length!=0){
      this.imagenes=e.target.files;
    }
  }

  onFileChange(e){

    this.aux2=this.aux2+1;
    //cargo los archivos al arreglo documentos
    if(e.target.files.length!=0){
    console.log("Files change",e)
    this.documentos=e.target.files;
    }
  }

  subirImagenes(){
    if(this.aux3!= 0){

      let formImg= new FormData();
      //con esto se reccorre el arreglo de imagenes que se quieren subir
      for (let img of this.imagenes){
        formImg.append("files",img,img.name);
      }
      console.log(formImg);
      
        this.http.post<any>('http://localhost:3000/viajes/multi/img',formImg).subscribe(
        (res)=>console.log(res),
        (err)=>console.log(err)
        );
    }else{
      return "no hay imagenes para agregar!";
    };
  }
  subirDoc(){
    if(this.aux2 != 0){
    console.log(this.documentos)
    let formDoc= new FormData();
    //con esto se reccorre el arreglo de imagenes que se quieren subir
    for (let doc of this.documentos){
      formDoc.append("documents",doc,doc.name);
    }
    console.log(formDoc);
    this.http.post<any>('http://localhost:3000/viajes/multi/doc',formDoc).subscribe(
      (res)=>console.log(res),
      (err)=>console.log(err)
    );
    }
  }
  saveViaje(){
    if(this.viaje.Lugar!=''){
      delete this.viaje.Viaje_ID;
      this.viaje.Proyecto_Proy_ID=this.proyecto_id;
      this.viajes.postViajeProyecto(this.viaje)
      .subscribe(
        res => {
          console.log('viaje registrado con exito')
          this.Ultimo_viaje=res;
          this.guardarRutasImg();
          this.subirImagenes();
          this.guardarRutasDoc();
          this.subirDoc();
          this.router.navigate(['/viajes']);
        },
        err => console.error(err)
      )
    }else{
      console.log("parametros nulos")
      this.router.navigate(['/viajes']);
    }
      
  }

  guardarRutasImg(){
    //con esto tengo el id del ultimo viaje creado y tambien tengo el id del proyecto
    //luego 
    
    var inserRutaFotos:fotos_viaje={
      URL:'',
      Viaje_Viaje_ID:null,
      Viaje_Proyecto_Proy_ID:this.proyecto_id,
      Nombre:''
    };
    if(this.edit){
      inserRutaFotos.Viaje_Viaje_ID=this.viaje.Viaje_ID;
    }else{
      inserRutaFotos.Viaje_Viaje_ID=this.Ultimo_viaje[0].Viaje_ID;
    }
    console.log(inserRutaFotos.Viaje_Viaje_ID);
    for (let img of this.imagenes){
      inserRutaFotos.Nombre=img.name;
      inserRutaFotos.URL='http://localhost:3000/'+img.name;
      console.log(inserRutaFotos);
      this.viajes.postImg(inserRutaFotos)
      .subscribe(
        res => {
          console.log(`se a agregado la ruta de ${inserRutaFotos.Nombre} correctamente a la bd!`);
          console.log(res);
        },
        err => console.error(err)
      )
    }

  }
  guardarRutasDoc(){
    //con esto tengo el id del ultimo viaje creado y tambien tengo el id del proyecto
    //luego 
    var inserRutaDoc:doc_viaje={
      URL:'',
      Viaje_Viaje_ID:null,
      Viaje_Proyecto_Proy_ID:this.proyecto_id,
      Nombre:''
    };
    if(this.edit){
      inserRutaDoc.Viaje_Viaje_ID=this.viaje.Viaje_ID;
    }else{
      inserRutaDoc.Viaje_Viaje_ID=this.Ultimo_viaje[0].Viaje_ID;
    }
    if(this.aux2!=0){
      for (let doc of this.documentos){
            inserRutaDoc.Nombre=doc.name;
            inserRutaDoc.URL='http://localhost:3000/download/'+doc.name;
            console.log(inserRutaDoc);
            this.viajes.postDoc(inserRutaDoc)
            .subscribe(
              res => {
                console.log(`se a agregado la ruta de ${inserRutaDoc.Nombre} correctamente a la bd!`);
                console.log(res);
              },
              err => console.error(err)
            )
          }
    }
    

  }

}
