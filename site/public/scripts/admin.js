$(document).ready(function(){

    $('#exercise_add_btn').on('click', function(){
      $('#add_modal').fadeToggle();
    });

    $('#add_modal_close').on('click', function(){
      $('#add_modal').fadeToggle();
      document.getElementById('add_exercise_form').reset();
      document.getElementById('body_part_select').selectedIndex = 0;
    });

    $('#exercise_edit_btn').on('click', function(){
      $('#edit_modal').fadeToggle();
      $.ajax({
        url: '/load_exercises',
        type: 'GET',
        success: function(res){
          let options = '';
          for(var i = 0; i < res.length; i++){
            options += '<option data-value="'+res[i].id+'" value="'+res[i].exercise_name+'"/>';
          }
          document.getElementById('exercises').innerHTML = options;
        }
      });
    });

    $('#edit_modal_close').on('click', function(){
      document.getElementById('edit_exercise_form').reset();
      document.getElementById('edit_body_part_select').selectedIndex = 0;
      $('#edit_modal').fadeToggle();
    });
    
    $('#add_exercise_form').submit(function(event){
      event.preventDefault();
      $.ajax({
        url: '/add_exercise',
        type: 'POST',
        data: {
          'exercise_name': $(this)[0][0].value,
          'body_part': $(this)[0][1].value
        },
        success: function(){
          document.getElementById('add_exercise_form').reset();
          document.getElementById('body_part_select').selectedIndex = 0;
        }
      })
    })

    $('#search').on('change', function(){
      $.ajax({
        url: '/load_single_exercise',
        type: 'POST',
        data: {'id': $('#exercises [value="'+$('#search').val()+'"]').data('value')},
        success: function(res){
          document.getElementById('exercise_id').value = res.id;
          document.getElementById('edit_exercise_name').value = res.exercise_name;
          document.getElementById('edit_body_part_select').value = res.body_part;
        }
      })
    });

    $('#edit_submit').on('click', function(event){
      event.preventDefault();
      $.ajax({
        url: '/edit_exercise',
        type: 'POST',
        data: {
          'id': $('#edit_exercise_form')[0][1].value,
          'exercise_name': $('#edit_exercise_form')[0][2].value,
          'body_part': $('#edit_exercise_form')[0][3].value
        },
        success: function(){
          document.getElementById('edit_exercise_form').reset();
          document.getElementById('edit_body_part_select').selectedIndex = 0;
          $('#edit_modal').fadeToggle();
        }
      })
    });

    $('#delete').on('click', function(event){
      event.preventDefault();
      $.ajax({
        url: '/delete_exercise',
        type: 'POST',
        data: {
          'id': $('#edit_exercise_form')[0][1].value,
        },
        success: function(){
          document.getElementById('edit_exercise_form').reset();
          document.getElementById('edit_body_part_select').selectedIndex = 0;
          $('#edit_modal').fadeToggle();
        }
      })
    });
});
