# Question 1

This code first attempts to acquire a lock by testing whether the value stored at `flag` is equal to 0. If it is not equal to 0, it spins (loops) until it is equal to 0.

Once it is equal to 0, it moves to the next line and sets flag to 1.

Next, it loads the value stored in `count`, incremets it by 1, and stores the resulting value in `count`.

We then store `0` in the `flag` variable.

Finally, we loop until `%bx` is equal to 0.

# Question 2

Running `flag.s` with the defult works because no interrupt occurs during the critical section.

I predict the value of `flag` will be `0` because the final operation with `flag` is the second thread setting its value to `0`. (Correct).

# Question 3

When the `%bx` register is set to 2 in both threads, there is no difference to the answer in Question 2. The difference is that both threads run the `.top` command twice.

# Question 4

An interrupt set to 2 leads to bad outcome. Reason: both threads are interrupted after both the load and test of the `.test` value occurs. Therefore, the first threads acquires the lock. Then, when interrupted, the second thread acquires the lock. Now both threads enter the critical section concurrently.

If we set the interrupt interval so that the interrupt does not occur AFTER the load of `.flag` AND BEFORE the test op, then we will have a good outcome.

# Question 5

The lock acquire uses the atomic exchange command to set the `mutex` variable to 1. Atomically, it will return the current value of `mutex` (before 1 is written to it). If the return value is 0, that means the lock is free.

To release the lock, just set `mutex` to 0.

# Question 6

The code appears to work as intended.

Unlike earlier where a thread could load the `flag` value and be interrupted before setting `flag` to 1, the atomic exchange command ensures that the load and set occur atomically. Therefore, only one thread at a time could load the `mutex` value when it is equal to `0`.

This does lead to inefficient use of the CPU. Only one thread can enter the critical section at a time. Therefore, while one thread holds the lock, the other thread will spin unnecessarily.

The amount of inefficient CPU time:

The acquire/spin loop is 4 instructions in length. If an interrupt occurs while the previous thread is holding the lock, any execution of the acquire loop is inefficient CPU usage. UNLESS the atomic swap instruction is not executed. This is because this is the only instruction whose effect will be different depending on if the lock is held when executed. Therefore, to clarify, only the acquire instructions executed after atomic swap (including the atomic swap) are inefficient CPU usage.

# Question 7

Using -P 0011111111, the right thing does happen. The first thread calls the atomic exchange instruction. Then the second thread continues to spin until the first thread sets the value of `mutex` to 0 again.

# Question 8

Nothing to do.

# Question 9

If the interupt interval >= program length, then no spinning occurs. This is because the other thread has not attempted to acquire the lock, and therefore does not flip its associated bit in the flag variable.

The same is true if the first thread releases the lock before the interrupt.

Otherwise, once the other thread sets its flag value to 1, the current thread will spin until either the other thread releases the lock (thus setting its flag to 0) or attempting to acquire the lock (thus setting the turn to the current thread). If the latter occurs, the current thread must NOT execute `mov %cx, turn` (otherwise it flips turn to other thread).

# Question 10

- `-P 000001111111111111` - thread 0 sets flag, but does not change turn value
- `-P 000000111111111111` - thread 0 sets flag and sets turn to thread 1
- `-P 0000000000111111111111111111` - thread 0 enters critical section and thread 1 spins until thread 0 releases lock

# Question 11

The threads do spend majority of time spinning. When a thread releases the lock, the turn increments by 1 and it acquires a new ticket. However, the current turn is held by the other thread. Therefore, the current thread will continue spinning. Once the other thread gains control, it too will execute the critical section, increment turn, and then spin because the current turn is owned by the other thread (from previous interval).

# Question 12

As more threads are added, the situation can become worse.

This occurs when a thread does not release the lock before the interrupt.

In such a case, the other threads will grab a ticket, but each are unable to enter the critical section.

Once the first thread releases the lock, the other threads will be able to eecute the previously "queued" critical section.

However, this first thread will not be able to execute the critical section AFTER releasing the lock. This occurs because the other threads have tickets which preceed the current thread's newly acquired ticket.

Subsequently, each thread will only be able to execute the critical section once per interval. The rest of the interval is spent spinning.

# Question 13

With an interupt interval of 7, test-and-set wastes 4 instructions spinning. With yield, instead of 4 wasted instructions, there is only one or two "wasted" instruction (yield and jump instructions). These savings arise whenever an interupt occurs while a thread holds the lock.

# Question 14

This lock performs two tests during lock acquisition.

First, it tests if the mutext equals 0. If it does not, it spins.

If it does equal 0, then it performs an atomic swap. Then again, it performs a test. If the lock was not free, it spins and performs the first test again. Otherwise, lock is acquired.

Savings:

It seems the savings are performing fewer atomic swaps. I assume the `mov & test` instructions pair are cheaper than `mov & xchg` instructions. We achieve savings by spinning with the `mov & test` and only performing `xchg` once there is a possibility that `mutex == 0`.
