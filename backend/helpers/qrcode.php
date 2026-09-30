<?php
function generateTicketQRCode($bookingId) {
    $qrData = "VERIFIED-TICKET-BOOKING-ID-" . $bookingId;
    return "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" . urlencode($qrData);
}
?>