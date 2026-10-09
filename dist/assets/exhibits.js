(()=>{
  const root=document.getElementById('seismique-jungle-reveal');
  const grid=root.querySelector('#exhibit-grid');
  const dialog=root.querySelector('#exhibit-dialog');
  // Published exhibit names and images: seismique.com/immersive-art-museum, 2026-10-02.
  // Individual artist credits will be added after the creative team confirms the mapping.
  const exhibits=[
    {id:'eden',name:'Eden',description:'Wander among luminous plants in an otherworldly garden.'},
    {id:'alien-grass',name:'Alien Grass',description:'Gently shake the globe to set its colors in motion.'},
    {id:'abduction',name:'Abduction',description:'Pose beneath a UFO beam for an intergalactic photo.'},
    {id:'archive',name:'Archive',description:'Move your hands over the colors and see how they respond.'},
    {id:'facemaking',name:'Facemaking',description:'Discover a different version of yourself in a world of mirrors.'},
    {id:'kaleidral',name:'Kaleidral',description:'Experiment with the buttons to reveal patterns of light.'},
    {id:'brainwasher',name:'Brainwasher',description:'Lose yourself in a mesmerizing visual display.'},
    {id:'venus',name:'Venus',description:'Climb into a colorful play space and explore your way through.'},
    {id:'fraction',name:'Fraction',description:'See your surroundings broken into unexpected fragments.'}
  ];
  const photoUrls={"alien-grass":"https://static.wixstatic.com/media/95b67b_8f27d81af701412b9994dec16b6c7519~mv2.jpeg/v1/fill/w_980,h_1307,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/95b67b_8f27d81af701412b9994dec16b6c7519~mv2.jpeg","abduction":"https://static.wixstatic.com/media/51d719_8e6be0ddfec0411597bce74515604f4e~mv2.jpeg/v1/fill/w_980,h_1307,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/51d719_8e6be0ddfec0411597bce74515604f4e~mv2.jpeg","archive":"https://static.wixstatic.com/media/51d719_05c50e841acf4b06ac38fa0f7e78ba9a~mv2.jpg/v1/fill/w_980,h_1307,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/51d719_05c50e841acf4b06ac38fa0f7e78ba9a~mv2.jpg","facemaking":"https://static.wixstatic.com/media/95b67b_56160d5fc8ed443793d774041e1a944f~mv2.jpeg/v1/fill/w_980,h_1307,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/95b67b_56160d5fc8ed443793d774041e1a944f~mv2.jpeg","kaleidral":"https://static.wixstatic.com/media/51d719_ce05bb6ddd9944afbdc72b3a26340b38~mv2.jpeg/v1/fill/w_980,h_1307,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/51d719_ce05bb6ddd9944afbdc72b3a26340b38~mv2.jpeg","eden":"https://static.wixstatic.com/media/51d719_66e90e469f3b499fa31c5d6d9b92b8fa~mv2.jpeg/v1/fill/w_980,h_1307,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/51d719_66e90e469f3b499fa31c5d6d9b92b8fa~mv2.jpeg","brainwasher":"https://static.wixstatic.com/media/95b67b_64b2c29880e54c82be6fe2f3dfb731a3~mv2.jpg/v1/fill/w_980,h_550,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/95b67b_64b2c29880e54c82be6fe2f3dfb731a3~mv2.jpg","venus":"https://static.wixstatic.com/media/95b67b_befb6c952cd84620844c10d7b7ff721a~mv2.jpeg/v1/fill/w_980,h_1307,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/95b67b_befb6c952cd84620844c10d7b7ff721a~mv2.jpeg","fraction":"https://static.wixstatic.com/media/51d719_4fce67793aeb4e73acf96c67b3fb0943~mv2.jpg/v1/fill/w_980,h_1073,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/51d719_4fce67793aeb4e73acf96c67b3fb0943~mv2.jpg"};
  let opener;
  for(const [index,exhibit] of exhibits.entries()){
    const button=document.createElement('button');
    button.type='button';button.className='exhibit-card';button.dataset.exhibit=exhibit.id;
    button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','exhibit-dialog');
    button.setAttribute('aria-label','Explore '+exhibit.name);
    const image=document.createElement('img');
    image.src=photoUrls[exhibit.id];image.alt='';image.loading='lazy';image.decoding='async';image.width=600;image.height=800;
    const label=document.createElement('span');label.className='exhibit-card-label';
    const number=document.createElement('span');number.className='exhibit-number';number.textContent=String(index+1).padStart(2,'0')+' / EXHIBIT';
    const name=document.createElement('span');name.className='exhibit-name';name.textContent=exhibit.name;
    const action=document.createElement('span');action.className='exhibit-card-action';action.textContent='Take a closer look';
    label.append(number,name,action);button.append(image,label);grid.append(button);
    button.addEventListener('click',()=>{
      opener=button;
      const detailImage=dialog.querySelector('#exhibit-detail-image');
      detailImage.src=image.src;detailImage.alt=exhibit.name+' at Seismique';
      dialog.querySelector('#exhibit-detail-title').textContent=exhibit.name;
      dialog.querySelector('#exhibit-detail-description').textContent=exhibit.description;
      dialog.showModal();
    });
  }
  dialog.querySelector('.exhibit-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
  window.addEventListener('popstate',()=>{if(dialog.open)dialog.close();});
  window.addEventListener('hashchange',()=>{if(dialog.open)dialog.close();});
})();
