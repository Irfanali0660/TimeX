function getModal(id) {
  $.ajax({
    type: "POST",
    url: "/getModal",
    data: {
      id,
    },
    dataType: "json",
    encode: true,
  }).done(function (data) {
    $("#prodImg").attr("src", "/productimages/" + data.image[0]);
    $("#name").html(data.name);
    $("#price").html(data.price);
    $("#description").html(data.description);
    $("#addtocart2").attr("onclick", 'addtocart("' + data._id + '") ');
    $("#wishlist2").attr("onclick", 'wishlist("' + data._id + '") ');
  });
}
function addtocart(id) {
  $.ajax({
    type: "POST",
    url: "/addtocart",
    data: {
      id,
    },
    dataType: "json",
    encode: true,
  }).done(function (data) {
    cartCout();
    if (data == "LOGIN FIRST") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Login first!",
        footer: '<a class="text-decoration-none" href="/login">Go to login</a>',
      });
    } else if (data == "alreadyexit") {
      Swal.fire({
        icon: "warning",
        title: "Already added",
        footer: '<a class="text-decoration-none" href="/cart">Check cart</a>',
      });
    } else if (data.key == "added") {
      Swal.fire({
        icon: "success",
        title: "Successfully added",
        text: "Good job!",
        timer: 2000,
        footer: '<a class="text-decoration-none" href="/cart">GO TO CART</a>',
      });
    }
  });
}
function deletecart(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      let price = Number($("#" + id + "Price").html());
      let Qnty = Number($("#" + id + "Qnty").val());
      let currentTotal = Number($("#cartSubTotal").html());
      $("#cartSubTotal").html(currentTotal - price * Qnty);
      $.ajax({
        type: "POST",
        url: "/deletecart",
        data: {
          id,
        },
        dataType: "json",
        encode: true,
      }).done(function (data) {
        Swal.fire("removed!", "This product has been removed.", "success");
        cartCout();
        $("#" + id + "item").remove();
      });
    }
  });
}
function quantity(id) {
  let Qnty = Number($("#" + id + "Qnty").val());

  if (Number($("#" + id + "Qnty").attr("max")) > Qnty) {
    $.ajax({
      type: "POST",
      url: "/quantity",
      data: {
        id,
      },
      dataType: "json",
      encode: true,
    }).done(function (data) {
      let price = Number($("#" + id + "Price").html());
      let Qnty = Number($("#" + id + "Qnty").val());
      let currentTotal = Number($("#cartSubTotal").html());
      $("#" + id + "Qnty").val(Qnty + 1);
      $("#" + id + "TotalPrice").html(price * (Qnty + 1));
      $("#cartSubTotal").html(currentTotal + price);
      $("#Total").html(currentTotal + price);
      cartCout();
    });
  } else {
    Swal.fire({
      text: "Sorry! Limited stock",
    });
  }
}
function quantitydec(id) {
  $.ajax({
    type: "POST",
    url: "/quantitydec",
    data: {
      id,
    },
    dataType: "json",
    encode: true,
  }).done(function (data) {
    let price = Number($("#" + id + "Price").html());
    let Qnty = Number($("#" + id + "Qnty").val());
    $("#" + id + "TotalPrice").html(price * Qnty);
    let currentTotal = Number($("#cartSubTotal").html());
    $("#cartSubTotal").html(currentTotal - price);
    $("#Total").html(currentTotal - price);
    cartCout();

    if (data == "deleted") {
      Swal.fire("removed!", "Your product has been removed.", "success");
      $("#" + id + "item").remove();
    }
  });
}
function wishlist(id) {
  $.ajax({
    type: "post",
    url: "/addwishlist",
    data: {
      id,
    },
    dataType: "json",
    encode: true,
  }).done(function (data) {
    cartCout();
    if (data == "LOGIN FIRST") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Login first!",
        footer: '<a class="text-decoration-none" href="/login">Go to login</a>',
      });
    } else if (data == "alreadyexit") {
      Swal.fire({
        icon: "warning",
        title: "Already added",
        footer:
          '<a class="text-decoration-none" href="/wishlist">check whishlist</a>',
      });
    } else if (data.key == "added") {
      Swal.fire({
        icon: "success",
        title: "Successfully added",
        text: "Good job!",
        footer:
          '<a class="text-decoration-none" href="/wishlist">GO TO Wishlist</a>',
      });
    }
  });
}

function addaddress() {
  document.getElementById("actionmodel").reset();
  document.getElementById("actionmodel").setAttribute("action", "/addaddress");
}

function editaddress(id) {
  $.ajax({
    type: "POST",
    url: "/editaddress",
    data: {
      id,
    },
    dataType: "json",
    encode: true,
  }).done(function (data) {
    if (data == "LOGIN FIRST") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Login first!",
        footer: '<a href="/login">Go to login</a>',
      });
    }

    $("#actionmodel").attr("action", "/updateaddress/" + data._id);
    $("#name").val(data.name);
    $("#house").val(data.house);
    $("#post").val(data.post);
    $("#city").val(data.city);
    $("#district").val(data.district);
    $("#state").val(data.state);
    $("#pin").val(data.pin);
  });
}
function deleteaddress(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: "/deleteaddress",
        data: {
          id,
        },
        dataType: "json",
        encode: true,
      }).done(function (data) {
        $("#" + id + "item").remove();
        Swal.fire("removed!", "This Address has been removed.", "success");
      });
    }
  });
}
function userdetails(num) {
  $.ajax({
    type: "POST",
    url: "/userdetails",
    data: {
      key: $("#value" + num).val(),
      num,
    },
    dataType: "json",
    encode: true,
  }).done(function (data) {
    if (data.success == true) {
      resHTML =
        '<div class="alert alert-success alert-dismissible"> ' +
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
        "<strong>Success  </strong> " +
        data.message +
        "</div>";
      $("#response").html(resHTML);
    } else {
      resHTML =
        '<div class="alert alert-danger alert-dismissible"> ' +
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
        "<strong>Error!</strong> " +
        data.message +
        "</div>";
      $("#response").html(resHTML);
    }
  });
}
function orderid() {
  $.ajax({
    type: "POST",
    url: "/orderid",
    data: {},
    dataType: "json",
    encode: true,
  }).done(function (data) {
    if (data == "empty") {
      Swal.fire("Cart is empty");
    } else {
      location.href = "/checkout/" + data._id;
    }
  });
}
function searchFun(value) {
  document
    .getElementById("formsearch")
    .setAttribute("action", "/shop?search=" + value + "");
  $.ajax({
    type: "POST",
    url: "/searchFun",
    data: {
      value,
    },
    dataType: "json",
    encode: true,
  }).done(function (data) {
    //
    if (data == "noresult") {
      resHTML = '<h6 class="text-secondary ">NO RESULT</h6>';
      $("#searchResult").html(resHTML);
    } else {
      $("#searchResult").html("");
      resHTML = "";
      data.search.forEach(function (val) {
        if (val.type == "product") {
          resHTML +=
            '<a href="/productdetials/' +
            val.id +
            "/" +
            val.cate +
            '" class="text-decoration-none"><h6 class="text-dark ms-2 ">' +
            val.titile +
            "</h6></a>";
        } else {
          resHTML +=
            '<a href="/shop?cate=' +
            val.id +
            '"class="text-decoration-none"><h6 class="text-black ms-2">' +
            val.titile +
            "</h6></a>";
        }
      });
      $("#searchResult").append(resHTML);
    }
  });
}
function cancelOrder(id) {
  $.ajax({
    type: "POST",
    url: "/cancelOrder",
    data: {
      id,
    },
    dataType: "json",
    encode: true,
  }).done(function (data) {
    if (data == "Ordercanceled") {
      Swal.fire("removed!", "This Order has been canceled.", "success");
      resHTML =
        '<h5 class="text-success text-center border border-success">Order canceled</h5>';
      $("#cancel").html(resHTML);
    }
  });
}

function refresh() {
  document.getElementById("star").reset();
}

function createRecord() {}

function review(id) {
  $("#star").attr("action", "/Productreview/" + id);
}

function ReturnOrder(id) {
  $.ajax({
    type: "POST",
    url: "/returnOrder/" + id,
    data: $("#return").serialize(),
    dataType: "json",
    encode: true,
  }).done(function (data) {
    if (data == "Success") {
      Swal.fire(
        "Returned!",
        "We will response after 2 days and refund will add your wallet",
        "success"
      );
    }
  });
}
function deleteitem(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: "PUT",
        url: "/deleteitem",
        data: {
          id,
        },
        dataType: "json",
        encode: true,
      }).done(function (data) {
        Swal.fire("removed!", "This product has been removed.", "success");
        cartCout();
        $("#" + id + "item").remove();
      });
    }
  });
}
window.onload = cartCout();
function cartCout() {
  $.ajax({
    type: "get",
    url: "/count",
    data: {},
    dataType: "json",
    encode: true,
  }).done(function (data) {
    $("#CartLength").html(data.cart.length);
    $("#wishlist").html(data.wishlist.length);
  });
}
const total = Number($('#total').html())
const percentage = Number($('#discount').html())
const finalAmount = total - ((total * percentage) / 100)
$("#total").html(Math.round(finalAmount))

function couponcheck() {
  $.ajax({
    type: "POST",
    url: "/couponcheck",
    data: {
      key: $('#value').val(),
      id: $('#orderid').val()
    },
    dataType: "json",
    encode: true,
  }).done(function(data) {
    console.log(data.coupon);
    if (data == "LOGIN FIRST") {
      console.log("SWEET");
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Login first!',
        footer: '<a href="/login">Go to login</a>'
      })
    } else if (data.success == true) {
      resHTML = '<div class="alert alert-success alert-dismissible"> ' +
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
        '<strong>Success  </strong> ' + data.message +
        '</div>';
      $("#response").html(resHTML)
      const total = Number($('#total').html())
      const percentage = data.coupon.percentage
      const finalAmount = total - ((total * percentage) / 100)
      $("#discount").html(data.coupon.percentage)
      $("#total").html(Math.round(finalAmount))
    } else {
      resHTML = '<div class="alert alert-danger alert-dismissible"> ' +
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
        '<strong>Error!</strong>' + data.message +
        '</div>';
      $("#response").html(resHTML)
    }
  });
}
function walletCheck() {
  $.ajax({
    type: "post",
    url: "/walletCheck",
    data: {
      finalAmount: $('#total').html()
    },
    dataType: "json",
    encode: true,
  }).done(function(data) {
    console.log(data);
    if (data != "success") {
      resHTML = '<div class="alert alert-danger alert-dismissible"> ' +
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
        '<strong>Error!</strong> Not enough cash in your wallet Only ' + data.wallet +
        ' in your Wallet Choose another method</div>';
      $("#wallet").html(resHTML)
    }
  })

}
