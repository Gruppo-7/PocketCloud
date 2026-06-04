from machine import Pin, PWM
import time

pinB = Pin(23, Pin.OUT)

passiveBuzzer = PWM(pinB, 2000)

while True:
    passiveBuzzer.init()
    passiveBuzzer.duty(1000)
    passiveBuzzer.freq(4000)
    time.sleep(2)
    passiveBuzzer.duty(0)
    time.sleep(3)
        
passiveBuzzer.deinit()