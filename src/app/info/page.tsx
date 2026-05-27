import { Heart, MapPin, Clock, Shirt } from 'lucide-react'
export default function InfoPage() {
  return (
    <div style={{minHeight:'100vh',background:'#FAF8F4',fontFamily:'var(--font-body)'}}>
      <div style={{textAlign:'center',padding:'60px 24px 40px',background:'linear-gradient(180deg,#EDF4EA,#FAF8F4)'}}>
        <Heart size={20} fill="#7A9C6E" style={{color:'#7A9C6E',margin:'0 auto 16px'}} />
        <h1 style={{fontFamily:'var(--font-display)',fontSize:'clamp(2rem,6vw,3.5rem)',fontWeight:300,color:'#2d2825',lineHeight:1.1}}>Jennifer & Myles</h1>
        <p style={{color:'#7A9C6E',marginTop:8,letterSpacing:'3px',fontSize:13,textTransform:'uppercase'}}>May 11, 2027</p>
      </div>
      <div style={{maxWidth:640,margin:'0 auto',padding:'0 24px 60px'}}>
        <div style={{background:'#fff',borderRadius:16,border:'1px solid #e7e2da',overflow:'hidden',marginBottom:32}}>
          {[
            { icon:MapPin, label:'Venue', value:'Venue TBD' },
            { icon:Clock, label:'Ceremony', value:'4:00 PM · Reception follows at 6:00 PM' },
            { icon:Shirt, label:'Dress code', value:'Garden Formal' },
          ].map(({icon:Icon,label,value})=>(
            <div key={label} style={{display:'flex',alignItems:'flex-start',gap:16,padding:'20px 24px',borderBottom:'1px solid #f0ede8'}}>
              <div style={{width:36,height:36,borderRadius:10,background:'#EDF4EA',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon size={16} color="#7A9C6E"/></div>
              <div><p style={{fontSize:11,color:'#7A9C6E',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:4}}>{label}</p><p style={{fontSize:14,color:'#5a5044',lineHeight:1.6}}>{value}</p></div>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center',paddingTop:24,borderTop:'1px solid #e7e2da'}}>
          <Heart size={16} fill="#7A9C6E" style={{color:'#7A9C6E',margin:'0 auto 8px'}} />
          <p style={{color:'#aaa',fontSize:13}}>With love, Jennifer & Myles</p>
        </div>
      </div>
    </div>
  )
}
